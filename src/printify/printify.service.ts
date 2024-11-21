import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qrcode from 'qrcode';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Template } from './entities/template.entity';
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

    private async uploadDesign(
        imageBase64: string,
        external_id: string = null,
    ): Promise<any> {
        try {
            console.log('Starting image upload to Printify...');

            // Remove the data:image/png;base64, prefix if it exists
            const base64Data = imageBase64.replace(
                /^data:image\/\w+;base64,/,
                '',
            );

            external_id = external_id || `${Date.now()}`;

            // Prepare the upload request body according to Printify's documentation
            const uploadData = {
                file_name: `qr-tshirt-${external_id}.png`,
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
                'http://www.qrific.me/jesusarriagabarron123',
            );
            const uploadedImageUrl = await this.uploadDesign(
                qrCodeBase64,
                createOrderDto.external_id,
            );

            // Create the print details maintaining the original structure
            const printDetails = {
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
                                id: '94440fa7-2066-bc92-d65f-0f21dbace544',
                                name: '',
                                type: 'text/svg',
                                height: 1,
                                width: 1,
                                x: 0.5000000000000001,
                                y: 0.04616005405806614,
                                scale: 0.4317238384180558,
                                angle: 0,
                                font_family: 'Paytone One',
                                font_size: 200,
                                font_weight: 400,
                                font_color: '#000000',
                                input_text: 'scan me',
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
                address_to: createOrderDto.address_to,
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

    async getProducts(): Promise<any> {
        try {
            let response = await axios.get(
                `${this.baseUrl}/shops/${this.shopId}/products.json`,
                {
                    headers: this.headers,
                },
            );
            const [product] = response.data.data.filter(
                (product) => product.id == '67271259e6b9cf8cea03926e',
            );

            const productObj = {
                id: product.id,
                title: product.title,
                options: product.options,
                description: product.description,
                variants: product.variants,
                images: product.images,
            };

            productObj.variants = productObj.variants.reduce((acc, variant) => {
                if (variant.options.includes(521)) {
                    acc.push({
                        id: variant.id,
                        title: variant.title,
                        options: variant.options,
                        price: variant.price,
                        sku: variant.sku,
                    });
                }
                return acc;
            }, []);

            productObj.options = productObj.options.filter((option) => {
                if (option.type == 'size') {
                    return true;
                }
                if (option.type == 'color') {
                    option.values = option.values.filter((value) => {
                        if (value.id == 521) {
                            return true;
                        }
                        return false;
                    });
                    return {
                        name: option.name,
                        type: option.type,
                        values: option.values,
                    };
                }
            });

            return productObj;
        } catch (error) {
            Logger.error(error);
            throw new HttpException(
                `Failed to fetch products: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
