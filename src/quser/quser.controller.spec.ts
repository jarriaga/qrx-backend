import { Test, TestingModule } from '@nestjs/testing';
import { QuserController } from './quser.controller';
import { QuserService } from './quser.service';

describe('QuserController', () => {
  let controller: QuserController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [QuserController],
      providers: [QuserService],
    }).compile();

    controller = module.get<QuserController>(QuserController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
