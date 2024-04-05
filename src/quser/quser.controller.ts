import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { QuserService } from './quser.service';
import { CreateQuserDto } from './dto/create-quser.dto';
import { UpdateQuserDto } from './dto/update-quser.dto';

@Controller('quser')
export class QuserController {
  constructor(private readonly quserService: QuserService) {}

  @Post()
  create(@Body() createQuserDto: CreateQuserDto) {
    return this.quserService.create(createQuserDto);
  }

  @Get()
  findAll() {
    return this.quserService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quserService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuserDto: UpdateQuserDto) {
    return this.quserService.update(+id, updateQuserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quserService.remove(+id);
  }
}
