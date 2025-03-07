import { Controller, Post, Body, Get, Param, HttpException, HttpStatus } from '@nestjs/common';
import { PrintfulService } from './printful.service';
import { CreateTemplateDto } from './dto/create-template.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ApiTags } from '@nestjs/swagger';
import { CalculateShippingDto } from './dto/calculate-shipping.dto';

@ApiTags('Printful Service')
@Controller('printful')
export class PrintfulController {
    constructor(private readonly printfulService: PrintfulService) {}

    @Post('template')
    async createTemplate(@Body() createTemplateDto: CreateTemplateDto) {
        return this.printfulService.createTemplate(createTemplateDto);
    }
    

    @Post('order')
    async createOrder(@Body() createOrderDto: CreateOrderDto) {
        return this.printfulService.createOrder(createOrderDto);
    }

     @Get('order/:orderId')
    async getOrderStatus(@Param('orderId') orderId: string, @Param('shopId') shopId: string) {
        return this.printfulService.getOrderStatus(orderId, shopId);
    }

    @Get('shops')
    async getShops() {
        return this.printfulService.getShops();
    }

    @Get('catalog')
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
    async calculateShipping(@Body() calculateShippingDto: CalculateShippingDto) {
        console.log('calculate-shipping request:', calculateShippingDto);
        
        if (!calculateShippingDto.recipient || !calculateShippingDto.items || calculateShippingDto.items.length === 0) {
            throw new HttpException('Datos inválidos para calcular el envío.', HttpStatus.BAD_REQUEST);
        }
    
        return await this.printfulService.calculateShipping(calculateShippingDto);
    }
}
