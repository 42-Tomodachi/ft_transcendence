import { Test, TestingModule } from '@nestjs/testing';
import { GamesController } from './gameRecord.controller';

describe('GamesController', () => {
  let controller: GamesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GamesController],
    }).compile();

    controller = module.get<GamesController>(GamesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});