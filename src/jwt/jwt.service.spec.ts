import { Test, TestingModule } from '@nestjs/testing';
import { CONFIG_OPTIONS } from 'src/common/common.constants';
import { JwtService } from './jwt.service';
import * as jwt from 'jsonwebtoken';

const TEST_KEY = 'TEST_KEY';
const PAYLOAD = { email: 'test@visual.camp', role: 0 };
const SIGNED_TOKEN = 'TEST_SIGNED_TOKEN';

jest.mock('jsonwebtoken', () => {
  return {
    sign: jest.fn(() => SIGNED_TOKEN),
    verify: jest.fn(() => {
      return PAYLOAD;
    }),
  };
});

describe('JwtService', () => {
  let service: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtService,
        {
          provide: CONFIG_OPTIONS,
          useValue: { secretKey: TEST_KEY },
        },
      ],
    }).compile();

    service = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('sign', () => {
    it('should return a signed token', () => {
      const token = service.sign(PAYLOAD);
      expect(jwt.sign).toHaveBeenCalledTimes(1);
      expect(jwt.sign).toHaveBeenCalledWith(PAYLOAD, TEST_KEY);
      expect(token).toEqual(SIGNED_TOKEN);
    });
  });

  describe('verify', () => {
    it('should return decoded token', () => {
      const decodedToken = service.verify(SIGNED_TOKEN);
      expect(jwt.verify).toHaveBeenCalledTimes(1);
      expect(jwt.verify).toHaveBeenCalledWith(SIGNED_TOKEN, TEST_KEY);
      expect(decodedToken).toEqual(PAYLOAD);
    });
  });
});
