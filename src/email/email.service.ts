import { Injectable, Logger } from '@nestjs/common';
import * as SendGrid from '@sendgrid/mail';
import { ConfigService } from '@nestjs/config';
import { Order, OrderItem } from '@prisma/client';

@Injectable()
export class EmailService {
    constructor(private readonly configService: ConfigService) {
        SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
    }

    private formatPrice(cents: number): string {
        return (cents / 100).toFixed(2);
    }

    async sendOrderConfirmationToAdmin(order: Order & { items: OrderItem[] }) {
        //generate an just text email with the order details with html
        const email = {
            to: 'jbarron@200response.mx',
            from: {
                email: this.configService.get<string>(
                    'SENDGRID_VERIFIED_SENDER',
                ),
                name: 'Qrific - New Order',
            },
            subject: `Order Confirmation - ${order.orderNumber}`,
            html: `<p>Order Number: ${order.orderNumber}</p>
            <p>Order Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p>Order Time: ${new Date(order.createdAt).toLocaleTimeString()}</p>
            <p>Shipping Method: ${order.shippingMethod}</p>
            <p>Customer Email: ${order.email}</p>
            <p>Customer Phone: ${order.phone}</p>
            <p>Customer Address: ${order.address}</p>
            <p>Items:</p>
            <ul>
                ${order.items.map((item) => `<li>${item.productTitle} - ${item.variantTitle} - ${item.quantity}</li>`).join('')}
            </ul>
            `,
        };
        try {
            await SendGrid.send(email);
            Logger.log(
                `Confirmation email sent successfully for order ${order.orderNumber} to admin`,
                'EmailService',
            );
            return true;
        } catch (error) {
            Logger.error(error.response?.body || error.message, 'EmailService');
            throw error;
        }
    }

    async sendOrderConfirmation(order: Order & { items: OrderItem[] }) {
        Logger.log(
            `Sending confirmation email for order ${order.orderNumber}`,
            'EmailService',
        );

        const mail = {
            to: order.email,
            from: {
                email: this.configService.get<string>(
                    'SENDGRID_VERIFIED_SENDER',
                ),
                name: 'Qrific',
            },
            templateId: this.configService.get<string>(
                'SENDGRID_ORDER_CONFIRMATION_TEMPLATE_ID',
            ),
            dynamicTemplateData: {
                subject: `Order Confirmation - ${order.orderNumber}`,
                orderNumber: order.orderNumber,
                items: order.items.map((item) => ({
                    product: {
                        title: item.productTitle,
                        images: [
                            {
                                src: 'https://qrific.s3.us-east-1.amazonaws.com/public/website/qrific-t-shirt-white.jpg',
                            },
                        ],
                    },
                    variant: {
                        title: item.variantTitle,
                        price: this.formatPrice(item.price),
                    },
                    quantity: item.quantity,
                    totalPrice: this.formatPrice(item.price * item.quantity),
                })),
                subtotal: this.formatPrice(order.subtotal),
                shipping: this.formatPrice(order.shipping),
                total: this.formatPrice(order.total),
                shippingAddress: {
                    firstName: order.firstName,
                    lastName: order.lastName,
                    address: order.address,
                    city: order.city,
                    state: order.state,
                    zipCode: order.zipCode,
                    country: order.country,
                    phone: order.phone,
                },
                storeUrl: this.configService.get<string>('STORE_URL'),
                currentYear: new Date().getFullYear(),
                orderDate: new Date(order.createdAt).toLocaleDateString(),
                orderTime: new Date(order.createdAt).toLocaleTimeString(),
                shippingMethod: order.shippingMethod,
                customerEmail: order.email,
            },
        };

        try {
            await SendGrid.send(mail);
            Logger.log(
                `Confirmation email sent successfully for order ${order.orderNumber}`,
                'EmailService',
            );
            return true;
        } catch (error) {
            Logger.error(
                `Failed to send confirmation email for order ${order.orderNumber}`,
                'EmailService',
            );
            Logger.error(error.response?.body || error.message, 'EmailService');
            throw error;
        }
    }
}
