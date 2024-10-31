import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qrcode from 'qrcode';
import * as fs from 'fs/promises';
import { createReadStream } from 'fs';
import * as FormData from 'form-data';
import { Blob } from 'buffer';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Template } from './entities/template.entity';
import { Order } from './entities/order.entity';
import { PrintifyShopDto } from './dto/shop.dto';
import { Logger } from '@nestjs/common';
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

        // Generate QR code as base64
        try {
            const qrCodeBase64 = await qrcode.toDataURL(data, options);
            return qrCodeBase64;
        } catch (error) {
            console.error('QR Generation error:', error);
            throw new HttpException(
                `Failed to generate QR code: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async uploadDesign(imageBase64: string): Promise<string> {
        try {
            console.log('Starting image upload to Printify...');

            // Remove the data:image/png;base64, prefix if it exists
            const base64Data = imageBase64.replace(
                /^data:image\/\w+;base64,/,
                '',
            );

            // Prepare the upload request body according to Printify's documentation
            const uploadData = {
                file_name: `qr-design-${Date.now()}.png`,
                contents: base64Data,
            };

            const response = await axios.post(
                `${this.baseUrl}/uploads/images.json`,
                uploadData,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            console.log('Upload successful, response:', response.data);

            if (!response.data) {
                throw new Error('Invalid response from Printify API');
            }

            return response.data.preview_url;
        } catch (error) {
            console.error('Upload error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });

            throw new HttpException(
                `Failed to upload design: ${error.response?.data?.message || error.message}`,
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
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

            Logger.debug('Creating template with data:', createTemplateDto);
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

            Logger.debug(productData);
            const response = await axios.post(
                `${this.baseUrl}/shops/${createTemplateDto.shopId}/products.json`,
                productData,
                {
                    headers: this.headers,
                },
            );

            return response.data;
        } catch (error) {
            Logger.error(error);
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

    async getShops(): Promise<PrintifyShopDto[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/shops.json`, {
                headers: {
                    Authorization: `Bearer ${this.apiKey}`,
                },
            });
            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to fetch shops: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
