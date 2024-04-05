import { Injectable } from '@nestjs/common';
import { CreateQuserDto } from './dto/create-quser.dto';
import { UpdateQuserDto } from './dto/update-quser.dto';

@Injectable()
export class QuserService {
  create(createQuserDto: CreateQuserDto) {
    return 'This action adds a new quser';
  }

  findAll() {
    return `This action returns all quser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} quser`;
  }

  update(id: number, updateQuserDto: UpdateQuserDto) {
    return `This action updates a #${id} quser`;
  }

  remove(id: number) {
    return `This action removes a #${id} quser`;
  }
}
