import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateOrderDto as PrintifyCreateOrderDto } from 'src/printify/dto/create-order.dto';
import { customAlphabet } from 'nanoid';
import { EmailService } from 'src/email/email.service';
import { PrintifyService } from 'src/printify/printify.service';
import { QrcodeService } from 'src/qrcode/qrcode.service';
@Injectable()
export class CheckoutService {
    private stripe: Stripe;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private emailService: EmailService,
        private printifyService: PrintifyService,
        private qrCodeService: QrcodeService,
    ) {
        this.stripe = new Stripe(this.configService.get('STRIPE_SECRET_KEY'), {
            apiVersion: '2024-11-20.acacia',
        });
    }

    getOrderNumber() {
        const date = new Date();
        const YY = date.getFullYear().toString().slice(-2);
        const MM = String(date.getMonth() + 1).padStart(2, '0');
        const DD = String(date.getDate()).padStart(2, '0');
        const YYMMDD = YY + MM + DD;
        return YYMMDD;
    }

    async createPaymentIntent(createOrderDto: CreateOrderDto) {
        try {
            const {
                verifiedTotal,
                verifiedSubtotal,
                verifiedShipping,
                taxAmount,
                taxRate,
                taxName,
            } = await this.verifyAndCalculatePrices(createOrderDto);

            const alphabet = 'A0123456789';
            const nanoid = customAlphabet(alphabet, 6);
            let orderNumber = `${this.getOrderNumber()}${nanoid()}`;
            // Check if order with order number already exists
            let orderExists;
            let isOrderNumberUnique = false;
            while (!isOrderNumberUnique) {
                orderExists = await this.prisma.order.findFirst({
                    where: { orderNumber },
                });
                if (!orderExists) {
                    isOrderNumberUnique = true;
                } else {
                    orderNumber = `${this.getOrderNumber()}${nanoid()}`;
                }
            }

            // Create a payment intent with Stripe
            const paymentIntent = await this.stripe.paymentIntents.create({
                amount: verifiedTotal,
                currency: 'usd',
                automatic_payment_methods: {
                    enabled: true,
                },
                metadata: {
                    orderNumber,
                    taxName,
                },
            });

            // Create order in database using Prisma transaction
            // Create order with verified amounts
            const order = await this.prisma.$transaction(async (prisma) => {
                const order = await prisma.order.create({
                    data: {
                        orderNumber,
                        email: createOrderDto.address.email,
                        firstName: createOrderDto.address.firstName,
                        lastName: createOrderDto.address.lastName,
                        address: createOrderDto.address.address,
                        city: createOrderDto.address.city,
                        state: createOrderDto.address.state,
                        zipCode: createOrderDto.address.zipCode,
                        country: createOrderDto.address.country,
                        phone: createOrderDto.address.phone,
                        shippingMethod: createOrderDto.shippingMethod,
                        subtotal: verifiedSubtotal,
                        shipping: verifiedShipping,
                        tax: taxAmount,
                        taxRate,
                        total: verifiedTotal,
                        paymentIntentId: paymentIntent.id,
                        items: {
                            create: createOrderDto.items.map((item) => ({
                                productId: item.product.id,
                                productTitle: item.product.title,
                                variantId: item.variant.id.toString(),
                                variantTitle: item.variant.title,
                                price: item.variant.price,
                                quantity: item.quantity,
                            })),
                        },
                    },
                    include: {
                        items: true,
                    },
                });

                return order;
            });

            return {
                clientSecret: paymentIntent.client_secret,
                orderNumber: order.orderNumber,
                verifiedTotal,
                verifiedSubtotal,
                verifiedShipping,
                taxAmount,
                taxRate,
            };
        } catch (error) {
            throw new Error(`Error creating payment intent: ${error.message}`);
        }
    }

    async confirmOrder(paymentIntentId: string) {
        try {
            const order = await this.prisma.order.findUnique({
                where: { paymentIntentId },
                include: { items: true },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            // Verify payment status with Stripe
            const paymentIntent =
                await this.stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status === 'succeeded') {
                Logger.debug('New payment intent succeeded');
                Logger.debug(paymentIntentId);

                const updatedOrder = await this.prisma.order.update({
                    where: { id: order.id },
                    data: { status: 'paid' },
                    include: { items: true },
                });

                // Send confirmation email
                try {
                    const createOrderDto: PrintifyCreateOrderDto = {
                        external_id: updatedOrder.orderNumber,
                        line_items: updatedOrder.items.map((item) => ({
                            product_id: item.productId,
                            variant_id: item.variantId,
                            quantity: item.quantity,
                        })),
                        address_to: {
                            first_name: updatedOrder.firstName,
                            last_name: updatedOrder.lastName,
                            address1: updatedOrder.address,
                            city: updatedOrder.city,
                            state: updatedOrder.state,
                            region: updatedOrder.state,
                            zip: updatedOrder.zipCode,
                            country: updatedOrder.country,
                            phone: updatedOrder.phone,
                            email: updatedOrder.email,
                        },
                        shipping_method: 1,
                    };
                    const qrCodes =
                        await this.qrCodeService.createQrCode(createOrderDto);
                    await this.printifyService.createOrder(
                        createOrderDto,
                        qrCodes,
                    );
                    await this.emailService.sendOrderConfirmation(updatedOrder);
                    await this.emailService.sendOrderConfirmationToAdmin(
                        updatedOrder,
                    );
                    Logger.log(
                        `Confirmation email sent for order ${order.orderNumber}`,
                    );
                } catch (emailError) {
                    Logger.error(
                        `Failed to send confirmation email: ${emailError.message}`,
                    );
                    // Don't throw the error as we don't want to roll back the order confirmation
                }

                return updatedOrder;
            } else {
                throw new Error('Payment not confirmed');
            }
        } catch (error) {
            throw new Error(`Error confirming order: ${error.message}`);
        }
    }

    async getOrderSecure(paymentIntentId: string) {
        try {
            const order = await this.prisma.order.findFirst({
                where: {
                    AND: [
                        { paymentIntentId },
                        //  { status: 'paid' }, // Only return paid orders
                    ],
                },
                include: { items: true },
            });

            if (!order) {
                throw new Error('Order not found or unauthorized');
            }

            return order;
        } catch (error) {
            throw new Error(`Error fetching order: ${error.message}`);
        }
    }

    async handleStripeWebhook(signature: string, payload: Buffer) {
        try {
            Logger.log('Received webhook event', 'CheckoutService');
            const event = this.stripe.webhooks.constructEvent(
                payload,
                signature,
                this.configService.get('STRIPE_WEBHOOK_SECRET'),
            );
            Logger.debug('Event Type: ' + event.type, 'CheckoutService');

            switch (event.type) {
                case 'payment_intent.succeeded':
                    await this.confirmOrder(event.data.object.id);
                    break;
                case 'payment_intent.payment_failed':
                    await this.prisma.order.update({
                        where: { paymentIntentId: event.data.object.id },
                        data: { status: 'failed' },
                    });
                    break;
            }

            return { received: true };
        } catch (error) {
            throw new Error(`Webhook Error: ${error.message}`);
        }
    }

    async getOrderStatus(email: string, orderNumber: string): Promise<any> {
        try {
            Logger.debug(
                `Getting order status for ${email} and ${orderNumber}`,
                'CheckoutService',
            );
            const order = await this.prisma.order.findFirst({
                where: { email, orderNumber },
            });

            if (!order) {
                throw new Error('Order not found or unauthorized');
            }
            return order;
        } catch (error) {
            throw new Error(`Error fetching order: ${error.message}`);
        }
    }

    async verifyAndCalculatePrices(createOrderDto: CreateOrderDto) {
        try {
            // 1. Get product from Printify
            const product = await this.printifyService.getProducts();

            // 2. Verify and calculate items total
            const verifiedItems = createOrderDto.items.map((item) => {
                const variant = product.variants.find(
                    (v) => v.id === parseInt(item.variant.id),
                );
                if (!variant) {
                    throw new Error(`Variant not found: ${item.variant.id}`);
                }

                if (variant.price !== item.variant.price) {
                    throw new Error(
                        `Price mismatch for variant ${item.variant.id}`,
                    );
                }

                return {
                    ...item,
                    verifiedPrice: variant.price,
                };
            });

            // 3. Calculate verified subtotal
            const verifiedSubtotal = verifiedItems.reduce(
                (sum, item) => sum + item.verifiedPrice * item.quantity,
                0,
            );

            // 4. Calculate shipping through Printify
            const shippingRates = await this.printifyService.calculateShipping({
                address_to: {
                    ...createOrderDto.address,
                    first_name: createOrderDto.address.firstName,
                    last_name: createOrderDto.address.lastName,
                    zip: createOrderDto.address.zipCode,
                    address1: createOrderDto.address.address,
                },
                line_items: verifiedItems.map((item) => ({
                    product_id: item.product.id,
                    variant_id: item.variant.id,
                    quantity: item.quantity,
                })),
            });

            Logger.debug('Shipping rates:', shippingRates);
            // 5. Get shipping cost based on method
            const verifiedShipping =
                createOrderDto.shippingMethod === 'express'
                    ? shippingRates.express
                    : shippingRates.standard;

            Logger.debug('Verified shipping:', verifiedShipping);

            // 6. Calculate tax
            const { rate: taxRate, name: taxName } =
                this.calculateTaxRate('TX');
            const taxAmount = Math.round(verifiedSubtotal * taxRate);

            Logger.debug('Tax calculation:', {
                state: createOrderDto.address.state,
                taxRate,
                taxName,
                taxAmount,
            });

            // 7. Calculate verified total with tax
            const verifiedTotal =
                verifiedSubtotal + verifiedShipping + taxAmount;

            return {
                verifiedItems,
                verifiedSubtotal,
                verifiedShipping,
                verifiedTotal,
                taxAmount,
                taxRate,
                taxName,
            };
        } catch (error) {
            Logger.error('Error verifying prices:', error);
            throw new Error(`Failed to verify prices: ${error.message}`);
        }
    }

    private calculateTaxRate(state: string = 'TX'): {
        rate: number;
        name: string;
    } {
        // US Sales Tax rates by state (update with current rates)
        const TAX_RATES = {
            CA: { rate: 0.0725, name: 'CA Sales Tax' },
            NY: { rate: 0.04, name: 'NY Sales Tax' },
            TX: { rate: 0.0625, name: 'TX Sales Tax' },
            // Add more states as needed
        };

        return TAX_RATES[state] || { rate: 0, name: 'No Tax' };
    }
}
