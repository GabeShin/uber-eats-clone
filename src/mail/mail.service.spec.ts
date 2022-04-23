import { Test, TestingModule } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { MailService } from './mail.service';

describe('MailService', () => {
  let service: MailService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailService,
        {
          provide: CONFIG_OPTIONS,
          useValue: 'CONFIG_OPTIONS',
        },
      ],
    }).compile();
    service = module.get<MailService>(MailService);
  });

  it.todo('should be defined');
  // it('should be defined', () => {
  //   expect(service).toBeDefined();
  // });
});
