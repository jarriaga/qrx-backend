import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PrintifyService } from './printify.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Printify Service')
@Controller('printify')
export class PrintifyController {
    constructor(private readonly qrTshirtService: PrintifyService) {}

    @Post('template')
    async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
        return this.qrTshirtService.createTemplate(createTemplateDto);
    }

    @Post('order/:productId')
    async createOrder(
        @Param('productId') productId: string,
        @Body() createOrderDto: CreateOrderDto,
    ) {
        return this.qrTshirtService.createOrder(productId, createOrderDto);
    }

    @Get('order/:shopId/:orderId')
    async getOrderStatus(
        @Param('shopId') shopId: string,
        @Param('orderId') orderId: string,
    ) {
        return this.qrTshirtService.getOrderStatus(orderId, shopId);
    }

    @Get('shops')
    async getShops() {
        return this.qrTshirtService.getShops();
    }
}
