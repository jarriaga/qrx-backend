import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as qrcode from 'qrcode';
import { PrintfulShopDto } from './dto/shop.dto';
import { Logger } from '@nestjs/common';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';
import { v4 as uuidv4 } from 'uuid';
import { PrismaService } from 'src/prisma/prisma.service';
import { QrType } from '@prisma/client';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { createCombinedTemplate } from './image/image-generation';
export interface NewOrder {
    recipient: {
        name: string;
        address1: string;
        city: string;
        state_code: string;
        country_code: string;
        zip: string;
        phone: string;
        email: string;
    };
    items: Array<{
        variant_id: number;
        quantity: number;
    }>;
}
@Injectable()
export class PrintfulService {
    private readonly apiKey: string;
    private readonly baseUrl: string;
    private readonly shopId: string;

    constructor(
        private readonly configService: ConfigService,
        private readonly prisma: PrismaService,
    ) {
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

    private async generateQRCode(data: string): Promise<Buffer> {
        try {
            const options = {
                width: 1000,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#0000', // Transparent color using RGBA format
                },
            };
            const qrCodeBuffer = await qrcode.toBuffer(data, options);
            return qrCodeBuffer;
        } catch (error) {
            console.error('QR Generation error:', error);
            throw new HttpException(
                `Failed to generate QR code: ${error.message}`,
                HttpStatus.INTERNAL_SERVER_ERROR,
            );
        }
    }

    private async uploadDesign(
        imageBuffer: Buffer,
        qrCodeId: string,
    ): Promise<string> {
        try {
            console.log('Starting image upload to Printful...');

            // Convert image buffer to base64 for logging/debugging
            console.log(
                `Image buffer received, size: ${imageBuffer.length} bytes`,
            );

            // Prepare S3 upload parameters
            const s3Client = new S3Client({
                region: 'us-east-1',
            });

            const bucketName = this.configService.get(
                'AWS_BUCKET_STORAGE_NAME',
            );
            const key = `public/qrcodes/${qrCodeId}.png`;

            // Upload the image buffer to S3
            const uploadParams = {
                Bucket: bucketName,
                Key: key,
                Body: imageBuffer,
                ContentType: 'image/png',
            };

            console.log(`Uploading to S3 bucket: ${bucketName}, key: ${key}`);
            const command = new PutObjectCommand(uploadParams);
            await s3Client.send(command);

            // Construct the S3 URL
            const uploadedUrl = `https://${bucketName}.s3.amazonaws.com/${key}`;
            console.log('S3 upload successful:', uploadedUrl);

            // Return the S3 URL of the uploaded image
            return uploadedUrl;
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

    // ToDo , update params DTO to fit the printful create order

    async createOrder(newOrder: NewOrder): Promise<any> {
        try {
            //generate UUID QR code
            const qrCodeId = uuidv4();
            //generate QR code url
            const qrCodeUrl = `${this.configService.get('STORE_URL')}/${qrCodeId}`;
            // Generate and upload new QR code
            const qrCodeBuffer = await this.generateQRCode(qrCodeUrl);
            //TODO
            //append the QR image to the T-shirt image
            const combinedTemplate = await createCombinedTemplate(qrCodeBuffer);
            if (!combinedTemplate || combinedTemplate.length === 0) {
                throw new Error('Failed to generate combined template');
            }
            //upload to S3
            const uploadedImageUrl = await this.uploadDesign(
                combinedTemplate,
                qrCodeId,
            );

            //create qr code in db
            const qrCode = await this.prisma.qrcode.create({
                data: {
                    id: qrCodeId,
                    urlCode: qrCodeUrl,
                    type: QrType.TEXT,
                },
            });

            console.log('QR Code created:', qrCode);
            console.log('Uploaded image URL:', uploadedImageUrl);
            console.log('New Order:', newOrder);

            return {
                qrCodeId,
                qrCodeUrl,
                uploadedImageUrl,
            };
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

    async generateQrCode(text: string, id: string): Promise<any> {
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
