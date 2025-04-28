import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { PrintfulService } from './printful.service';
import { ApiTags } from '@nestjs/swagger';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@ApiTags('Printful Service')
@Controller('printful')
export class PrintfulController {
    constructor(private readonly printfulService: PrintfulService) {}

    @Get('order/:orderId')
    async getOrderStatus(
        @Param('orderId') orderId: string,
        @Param('shopId') shopId: string,
    ) {
        return this.printfulService.getOrderStatus(orderId, shopId);
    }

    @Get('shops')
    async getShops() {
        return this.printfulService.getShops();
    }

    @Get('products')
    async getProducts() {
        return this.printfulService.getProducts();
    }

    @Get('variants/blueprint/:blueprintId/print-provider/:printProviderId')
    async getVariants(
        @Param('blueprintId') blueprintId: number,
        @Param('printProviderId') printProviderId: number,
    ) {
        return this.printfulService.getVariants(blueprintId, printProviderId);
    }

    @Post('calculate-shipping')
    async calculateShipping(@Body() data: CalculateShippingDto) {
        return this.printfulService.calculateShipping(data);
    }
}
