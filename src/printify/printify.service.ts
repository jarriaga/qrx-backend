import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qrcode from 'qrcode';
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
    private readonly shopId: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get('PRINTIFY_KEY');
        this.baseUrl = this.configService.get('PRINTIFY_BASEURL');
        this.shopId = this.configService.get('PRINTIFY_SHOP_ID');
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

    private async uploadDesign(imageBase64: string): Promise<any> {
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

            return response.data;
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

            console.log(
                createTemplateDto.variants.map((variant) => variant.id),
            );
            const productData = {
                title: createTemplateDto.title,
                description: createTemplateDto.description,
                blueprint_id: createTemplateDto.blueprint_id,
                print_provider_id: createTemplateDto.print_provider_id,
                variants: createTemplateDto.variants,
                print_areas: [
                    {
                        variant_ids: createTemplateDto.variants.map(
                            (variant) => variant.id,
                        ),
                        placeholders: [
                            {
                                images: [
                                    {
                                        id: placeholderImageUrl.id,
                                        x: 0.5,
                                        y: 0.5,
                                        scale: 1,
                                        angle: 0,
                                    },
                                ],
                                position: 'back',
                            },
                        ],
                    },
                ],
                is_personalized: true,
            };

            const response = await axios.post(
                `${this.baseUrl}/shops/${createTemplateDto.shop_id}/products.json`,
                productData,
                {
                    headers: this.headers,
                },
            );

            return response.data;
        } catch (error) {
            console.log(error.response.data);
            Logger.error(error);
            throw new HttpException(
                `Failed to create template: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async createOrder(createOrderDto: CreateOrderDto): Promise<any> {
        try {
            // Generate and upload new QR code
            const qrCodeBase64 = await this.generateQRCode(
                'http://www.qrific.me/jesusarriagabarron',
            );
            const uploadedImageUrl = await this.uploadDesign(qrCodeBase64);

            // Create the print details maintaining the original structure
            const printDetails = {
                variant_ids: [
                    /* ... variant IDs ... */
                ],
                placeholders: [
                    {
                        position: 'back',
                        images: [
                            {
                                id: uploadedImageUrl.id, // This will be replaced with the uploaded image id
                                //name: 'qr-design.png',
                                type: 'image/png',
                                height: 1000,
                                width: 1000,
                                x: 0.5000000000000001,
                                y: 0.5,
                                scale: 0.6442298892100188,
                                angle: 0,
                                //src: uploadedImageUrl, // Use the newly uploaded image URL
                            },
                            {
                                id: '6727134776dd9e38e5652f69',
                                name: 'qrific_cat.svg',
                                type: 'image/png',
                                height: 273,
                                width: 641,
                                x: 0.5000000000000001,
                                y: 0.21886922850787743,
                                scale: 0.6442298892100183,
                                angle: 0,
                                src: 'https://pfy-prod-image-storage.s3.us-east-2.amazonaws.com/20435315/38c96700-7ab8-41a1-be6d-824bc616bd59',
                            },
                            {
                                id: '6727159642cc89acd4317242',
                                name: 'QRIFIC.ME.svg',
                                type: 'image/png',
                                height: 89,
                                width: 526,
                                x: 0.5000000000000001,
                                y: 0.8509497999673548,
                                scale: 0.28390904950777607,
                                angle: 0,
                                src: 'https://pfy-prod-image-storage.s3.us-east-2.amazonaws.com/20435315/b3bd32ef-2cef-4808-8318-0fb5df402952',
                            },
                            {
                                id: '67271592a0be91703554a77d',
                                name: 'Group 58.svg',
                                type: 'image/png',
                                height: 199,
                                width: 638,
                                x: 0.5000000000000001,
                                y: 0.8509497999673548,
                                scale: 0.3543905314618505,
                                angle: 0,
                                src: 'https://pfy-prod-image-storage.s3.us-east-2.amazonaws.com/20435315/56c75257-d345-4e0e-8673-2b275a724e8c',
                            },
                        ],
                    },
                    {
                        position: 'front',
                        images: [
                            {
                                id: '6727177e76dd9e38e5652fee',
                                name: 'logoQrific.svg',
                                type: 'image/png',
                                height: 665,
                                width: 642,
                                x: 0.11513215341576868,
                                y: 0.10129894399364718,
                                scale: 0.18044016585530132,
                                angle: 0,
                                src: 'https://pfy-prod-image-storage.s3.us-east-2.amazonaws.com/20435315/f683e99a-cd95-416e-a73d-58d7f2db9406',
                            },
                        ],
                    },
                ],
            };

            // Prepare the order data
            const orderData = {
                external_id:
                    createOrderDto.external_id || `order-${Date.now()}`,
                line_items: createOrderDto.line_items.map((item) => ({
                    ...item,
                    print_details: printDetails,
                })),
                shipping_address: createOrderDto.shipping_address,
                shipping_method: createOrderDto.shipping_method,
            };

            console.log(
                'Creating order with data:',
                JSON.stringify(orderData, null, 2),
            );

            const response = await axios.post(
                `${this.baseUrl}/shops/${this.shopId}/orders.json`,
                orderData,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                        'Content-Type': 'application/json',
                    },
                },
            );

            return response.data;
        } catch (error) {
            console.error('Order creation error:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status,
            });

            throw new HttpException(
                `Failed to create order: ${error.response?.data?.message || error.message}`,
                error.response?.status || HttpStatus.INTERNAL_SERVER_ERROR,
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

    async getBlueprint(blueprintId: number): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/catalog/blueprints/${blueprintId}.json`,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to fetch blueprint: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getPrintProviders(): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/catalog/print_providers.json`,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to fetch print providers: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async getVariants(
        blueprintId: number,
        printProviderId: number,
    ): Promise<any> {
        try {
            const response = await axios.get(
                `${this.baseUrl}/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants.json`,
                {
                    headers: {
                        Authorization: `Bearer ${this.apiKey}`,
                    },
                },
            );
            return response.data;
        } catch (error) {
            throw new HttpException(
                `Failed to fetch variants: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
