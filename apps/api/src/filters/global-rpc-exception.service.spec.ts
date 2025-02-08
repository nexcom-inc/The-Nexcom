import { Test, TestingModule } from '@nestjs/testing';
import { GlobalRpcExceptionService } from './global-rpc-exception.service';

describe('GlobalRpcExceptionService', () => {
  let service: GlobalRpcExceptionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GlobalRpcExceptionService],
    }).compile();

    service = module.get<GlobalRpcExceptionService>(GlobalRpcExceptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
