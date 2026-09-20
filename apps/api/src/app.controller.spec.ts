import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    controller = moduleRef.get(AppController);
  });

  it('responde con status ok en /health', () => {
    const result = controller.getHealth();
    expect(result.status).toBe('ok');
    expect(typeof result.timestamp).toBe('string');
  });
});
