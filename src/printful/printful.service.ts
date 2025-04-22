import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qrcode from 'qrcode';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { Template } from './entities/template.entity';
import { PrintfulShopDto } from './dto/shop.dto';
import { Logger } from '@nestjs/common';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@Injectable()
export class PrintfulService {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly shopId: string;

    constructor(private readonly configService: ConfigService) {
        this.apiKey = this.configService.get('PRINTFUL_API_KEY');
        this.baseUrl = 'https://api.printful.com';
        this.shopId = this.configService.get('PRINTFUL_SHOP_ID');
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
            console.log('Starting image upload to Printful...');

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
                `${this.baseUrl}/files/add`,
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
                throw new Error('Invalid response from Printful API');
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
                `${this.baseUrl}/stores/${createTemplateDto.shop_id}/products`,
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
                                type: 'image/png',
                                height: 1000,
                                width: 1000,
                                x: 0.5000000000000001,
                                y: 0.5,
                                scale: 0.6442298892100188,
                                angle: 0,
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
                `${this.baseUrl}/stores/${this.shopId}/orders`,
                orderData,
                {
                    headers: this.headers,
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
                `${this.baseUrl}/stores/${shopId}/orders/${orderId}`,
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

    async getShops(): Promise<PrintfulShopDto[]> {
        try {
            const response = await axios.get(`${this.baseUrl}/stores`, {
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
                `${this.baseUrl}/catalog/blueprints/${blueprintId}`,
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
                `${this.baseUrl}/catalog/print_providers`,
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
                `${this.baseUrl}/catalog/blueprints/${blueprintId}/print_providers/${printProviderId}/variants`,
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
            const response = await axios.get(`${this.baseUrl}/store/products`, {
                headers: this.headers,
            });

            //get first product
            const firstProduct = response.data.result[0];

            const productDetails = await axios.get(
                `${this.baseUrl}/store/products/${firstProduct.id}`,
                {
                    headers: this.headers,
                },
            );

            Logger.debug('Printful API Response:');
            console.log(JSON.stringify(productDetails.data, null, 2));

            const productObj = {
                variants: productDetails.data.result.sync_variants,
            };

            return productObj;
        } catch (error) {
            Logger.error(error);
            throw new HttpException(
                `Failed to fetch products: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    async generateQrCode(text: string, id: string): Promise<string> {
        // Generate and upload placeholder QR
        Logger.debug('Generating QR code for:', text);
        const placeholderQR = await this.generateQRCode(text);
        const uploadImageResponse = await this.uploadDesign(placeholderQR, id);
        return uploadImageResponse;
    }

    async calculateShipping(data: CalculateShippingDto): Promise<any> {
        try {
            Logger.debug('Calculating shipping costs...', 'PrintfulService');
            if (
                !data.recipient.state_code ||
                data.recipient.state_code.trim() === ''
            ) {
                console.error(
                    '🚨 ERROR: state_code está vacío o no es válido:',
                    data.recipient.state_code,
                );
                throw new Error(
                    '🚨 ERROR: state_code está vacío o no es válido.',
                );
            }

            if (!data.recipient.zip || data.recipient.zip.trim() === '') {
                console.error(
                    '🚨 ERROR: zip está vacío o no es válido:',
                    data.recipient.zip,
                );
                throw new Error('🚨 ERROR: zip está vacío o no es válido.');
            }

            const validItems = data.items.filter(
                (item) => item.variant_id && Number(item.variant_id) > 0,
            );
            if (validItems.length === 0) {
                console.error(
                    '🚨 ERROR: Todos los `variant_id` son inválidos:',
                    data.items,
                );
                throw new Error(
                    '🚨 ERROR: `variant_id` inválidos o faltantes.',
                );
            }

            const requestBody = {
                recipient: {
                    name: `${data.recipient.first_name} ${data.recipient.last_name}`,
                    address1: data.recipient.address1,
                    city: data.recipient.city,
                    state_code: data.recipient.state_code.trim(),
                    country_code: data.recipient.country.trim().toUpperCase(),
                    zip: data.recipient.zip.trim(),
                    phone: data.recipient.phone,
                    email: data.recipient.email,
                },
                items: validItems.map((item) => ({
                    quantity: item.quantity,
                    variant_id: item.variant_id,
                })),
            };

            const headers = {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.apiKey}`, // Use this.apiKey instead of process.env
            };

            try {
                const response = await axios.post(
                    `${this.baseUrl}/shipping/rates`,
                    requestBody,
                    { headers },
                );

                if (!response.data || !response.data.result) {
                    throw new Error('Respuesta inválida de Printful.');
                }

                const shippingRates = response.data.result;
                if (!shippingRates || shippingRates.length === 0) {
                    throw new Error('No se encontraron tarifas de envío.');
                }

                const selectedRate =
                    shippingRates.find((rate) =>
                        rate.id.toUpperCase().includes('STANDARD'),
                    ) || shippingRates[0];

                Logger.debug('✅ Tarifa de envío seleccionada:', selectedRate);
                return selectedRate.rate;
            } catch (apiError) {
                console.log(apiError);
                Logger.error(
                    'Printful API error response:',
                    apiError.response?.data || apiError.message,
                );
                if (apiError.response) {
                    throw new Error(
                        `Printful API error: ${JSON.stringify(apiError.response.data)}`,
                    );
                }
                throw apiError;
            }
        } catch (error) {
            Logger.error('Shipping calculation failed:', error.message);
            throw new HttpException(
                `Failed to calculate shipping: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }
}
