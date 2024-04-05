import { Test, TestingModule } from '@nestjs/testing';
import { QuserService } from './quser.service';

describe('QuserService', () => {
  let service: QuserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QuserService],
    }).compile();

    service = module.get<QuserService>(QuserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
