import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qrcode from 'qrcode';
import * as fs from 'fs/promises';
import { Blob } from 'buffer';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Template } from './entities/template.entity';
import { Order } from './entities/order.entity';
import FormData from 'form-data';

@Injectable()
export class PrintifyService {
    private readonly apiKey: string;
    private readonly baseUrl: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get('PRINTIFY_KEY');
        this.baseUrl = this.configService.get('PRINTIFY_BASEURL');
    }

    private get headers() {
        return {
            Authorization: `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
        };
    }

    private async generateQRCode(data: string): Promise<string> {
        const options = {
            width: 1000,
            margin: 1,
            color: {
                dark: '#000000',
                light: '#FFFFFF',
            },
        };

        const qrImagePath = `./temp/qr-design-${Date.now()}.png`;

        try {
            await fs.mkdir('./temp', { recursive: true });
            await qrcode.toFile(qrImagePath, data, options);
            return qrImagePath;
        } catch (error) {
            throw new HttpException(
                `Failed to generate QR code: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async uploadDesign(imagePath: string): Promise<string> {
        try {
            const imageBuffer = await fs.readFile(imagePath);
            const form = new FormData();

            // Append the file buffer directly to form-data
            form.append('file', imageBuffer, {
                filename: 'qr-design.png',
                contentType: 'image/png',
            });

            const response = await axios.post(
                `${this.baseUrl}/uploads/images.json`,
                form.getBuffer(),
                {
                    headers: {
                        ...form.getHeaders(),
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                    maxBodyLength: Infinity,
                    maxContentLength: Infinity,
                },
            );

            await fs.unlink(imagePath); // Clean up temporary file
            return response.data.image_url;
        } catch (error) {
            throw new HttpException(
                `Failed to upload design: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createTemplate(
        createTemplateDto: CreateTemplateDto,
    ): Promise<Template> {
        try {
            // Generate and upload placeholder QR
            const placeholderQR = await this.generateQRCode('placeholder');
            const placeholderImageUrl = await this.uploadDesign(placeholderQR);

            const productData = {
                title: createTemplateDto.title,
                description: createTemplateDto.description,
                blueprint_id: createTemplateDto.blueprintId,
                print_provider_id: createTemplateDto.printProviderId,
                variants: createTemplateDto.variants,
                print_areas: {
                    front: placeholderImageUrl,
                },
                is_personalized: true,
            };

            const response = await axios.post(
                `${this.baseUrl}/shops/${createTemplateDto.shopId}/products.json`,
                productData,
                {
                    headers: this.headers,
                },
            );

            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to create template: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createOrder(
        productId: string,
        createOrderDto: CreateOrderDto,
    ): Promise<Order> {
        try {
            // Generate and upload personalized QR code
            const qrImagePath = await this.generateQRCode(
                createOrderDto.qrContent,
            );
            const personalizedImageUrl = await this.uploadDesign(qrImagePath);

            const orderData = {
                external_id: `order-${Date.now()}`,
                label: `QR T-Shirt Order - ${createOrderDto.qrContent}`,
                line_items: [
                    {
                        product_id: productId,
                        variant_id: createOrderDto.variantId,
                        quantity: 1,
                        print_details: {
                            front: personalizedImageUrl,
                        },
                    },
                ],
                shipping_method: 1,
                shipping_address: createOrderDto.shippingAddress,
                payment_method: createOrderDto.paymentMethod,
            };

            const response = await axios.post(
                `${this.baseUrl}/shops/${createOrderDto.shippingAddress.shop_id}/orders.json`,
                orderData,
                {
                    headers: this.headers,
                },
            );

            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to create order: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getOrderStatus(orderId: string, shopId: string): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/shops/${shopId}/orders/${orderId}.json`,
                {
                    headers: this.headers,
                },
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to get order status: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
