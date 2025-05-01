import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Stripe } from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { customAlphabet } from 'nanoid';
import { EmailService } from 'src/email/email.service';
import { NewOrder, PrintfulService } from 'src/printful/printful.service';
@Injectable()
export class CheckoutService {
    private stripe: Stripe;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private emailService: EmailService,
        private printfulService: PrintfulService,
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

            const order = await this.prisma.$transaction(async (prisma) => {
                const newOrder = await prisma.order.create({
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
                            create: createOrderDto.items.flatMap((item) => {
                                // Create an array to hold the individual item records
                                const individualItems = [];
                                // Loop 'quantity' times to create separate records
                                for (let i = 0; i < item.quantity; i++) {
                                    individualItems.push({
                                        productId: item.product.id,
                                        productTitle: item.product.title,
                                        variantId: item.variant.id.toString(),
                                        variantTitle: item.variant.title,
                                        price: item.variant.price,
                                        quantity: 1, // Set quantity to 1 for each individual record
                                    });
                                }
                                return individualItems;
                            }),
                        },
                    },
                    include: {
                        items: true,
                    },
                });

                return newOrder;
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

    async confirmOrder(order: NewOrder) {
        try {
            const paymentIntent = await this.stripe.paymentIntents.retrieve(
                order.paymentIntentId,
            );

            if (paymentIntent.status === 'succeeded') {
                Logger.debug('payment intent succeeded');
                Logger.debug(order.paymentIntentId);

                const updatedOrder = await this.prisma.order.update({
                    where: { id: order.orderId },
                    data: { status: 'paid' },
                    include: { items: true },
                });

                try {
                    await this.emailService.sendOrderConfirmation(updatedOrder);
                    Logger.log(
                        `Confirmation email sent for order ${order.orderNumber}`,
                    );
                } catch (emailError) {
                    Logger.error(
                        `Failed to send confirmation email: ${emailError.message}`,
                    );
                }

                return updatedOrder;
            } else {
                throw new Error('Payment not confirmed');
            }
        } catch (error) {
            throw new Error(`Error confirming order: ${error.message}`);
        }
    }

    async getOrderInformation(paymentIntentId: string) {
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
            const product = await this.printfulService.getProducts();

            const verifiedItems = createOrderDto.items.map((item) => {
                const variant = product.variants.find(
                    (v) => v.variant_id === parseInt(item.variant.id),
                );
                if (!variant) {
                    throw new Error(`Variant not found: ${item.variant.id}`);
                }

                if (
                    Number(variant.retail_price) * 100 !==
                    Number(item.variant.price)
                ) {
                    throw new Error(
                        `Price mismatch for variant ${item.variant.id}`,
                    );
                }

                return {
                    ...item,
                    verifiedPrice: Math.round(
                        Number(variant.retail_price) * 100,
                    ),
                };
            });

            const verifiedSubtotal = verifiedItems.reduce(
                (sum, item) => sum + item.verifiedPrice * item.quantity,
                0,
            );

            console.log('Verified Subtotal (cents):', verifiedSubtotal);

            console.log('Shipping Data Sent to Printful:', {
                recipient: {
                    first_name: createOrderDto.address.firstName,
                    last_name: createOrderDto.address.lastName,
                    address1: createOrderDto.address.address,
                    city: createOrderDto.address.city,
                    zip: createOrderDto.address.zipCode,
                    country_code: createOrderDto.address.country,
                    state: createOrderDto.address.state,
                    phone: createOrderDto.address.phone,
                    email: createOrderDto.address.email,
                },
                items: createOrderDto.items.map((item) => ({
                    variant_id: Number(item.variant.id),
                    quantity: item.quantity,
                })),
            });

            const shippingRates = await this.printfulService.calculateShipping({
                recipient: {
                    first_name: createOrderDto.address.firstName || 'N/A',
                    last_name: createOrderDto.address.lastName || 'N/A',
                    address1: createOrderDto.address.address || 'N/A',
                    city: createOrderDto.address.city || 'N/A',
                    state_code: createOrderDto.address.state
                        ? createOrderDto.address.state.trim().toUpperCase()
                        : 'N/A',
                    zip: createOrderDto.address.zipCode || '00000',
                    country_code: createOrderDto.address.country
                        ? createOrderDto.address.country.trim().toUpperCase()
                        : 'MX',
                    phone: createOrderDto.address.phone || '0000000000',
                    email:
                        createOrderDto.address.email || 'no-email@example.com',
                    state: createOrderDto.address.state || 'N/A',
                    country: createOrderDto.address.country || 'N/A',
                },
                items: createOrderDto.items
                    .map((item) => ({
                        variant_id:
                            Number(item.variant.id) > 0
                                ? Number(item.variant.id)
                                : 0,
                        quantity: item.quantity || 1,
                    }))
                    .filter((item) => item.variant_id > 0),
            });

            Logger.debug('Shipping rates:', shippingRates);

            const verifiedShipping = Math.round(Number(shippingRates) * 100);

            Logger.debug('Verified shipping (cents):', verifiedShipping);

            const { rate: taxRate, name: taxName } =
                this.calculateTaxRate('TX');
            const taxAmount = Math.round(
                (verifiedSubtotal + verifiedShipping) * taxRate,
            );

            Logger.debug('Tax calculation (cents):', {
                state: createOrderDto.address.state,
                taxRate,
                taxName,
                taxAmount,
            });

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
            TX: { rate: 0.0825, name: 'TX Sales Tax' },
        };

        return TAX_RATES[state] || { rate: 0, name: 'No Tax' };
    }

    async createOrder(paymentIntentId: string) {
        try {
            const order = await this.prisma.order.findFirst({
                where: { paymentIntentId },
                include: { items: true },
            });

            if (!order) {
                throw new Error('Order not found');
            }

            const orderObject: NewOrder = {
                orderId: order.id,
                qrCodeGenerated: order.qrCodeGenerated,
                paymentIntentId: order.paymentIntentId,
                orderNumber: order.orderNumber,
                recipient: {
                    name: `${order.firstName} ${order.lastName}`,
                    address1: order.address,
                    city: order.city,
                    state_code: order.state,
                    country_code: order.country,
                    zip: order.zipCode,
                    phone: order.phone,
                    email: order.email,
                },
                items: order.items.flatMap((item) => {
                    const items = [];
                    for (let i = 0; i < item.quantity; i++) {
                        items.push({
                            id: item.id,
                            variant_id: item.variantId,
                            quantity: 1,
                        });
                    }
                    return items;
                }),
            };

            await this.printfulService.createOrderOnPrintful(orderObject);

            const confirmedOrder = await this.confirmOrder(orderObject);

            return confirmedOrder;
        } catch (error) {
            throw new Error(`Error creating order: ${error.message}`);
        }
    }
}
