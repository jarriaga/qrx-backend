import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PrintifyService } from './printify.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Printify Service')
@Controller('printify')
export class PrintifyController {
    constructor(private readonly printifyService: PrintifyService) {}

    @Post('template')
    async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
        return this.printifyService.createTemplate(createTemplateDto);
    }

    @Post('order')
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.printifyService.createOrder(createOrderDto);
    }

    @Get('order/:shopId/:orderId')
    async getOrderStatus(
        @Param('shopId') shopId: string,
        @Param('orderId') orderId: string,
    ) {
        return this.printifyService.getOrderStatus(orderId, shopId);
    }

    @Get('shops')
    async getShops() {
        return this.printifyService.getShops();
    }

    @Get('catalog/:blueprintId')
    async getBlueprint(@Param('blueprintId') blueprintId: number) {
        return this.printifyService.getBlueprint(blueprintId);
    }

    @Get('print-providers')
    async getPrintProviders() {
        return this.printifyService.getPrintProviders();
    }

    @Get('variants/blueprint/:blueprintId/print-provider/:printProviderId')
    async getVariants(
        @Param('blueprintId') blueprintId: number,
        @Param('printProviderId') printProviderId: number,
    ) {
        return this.printifyService.getVariants(blueprintId, printProviderId);
    }
}
