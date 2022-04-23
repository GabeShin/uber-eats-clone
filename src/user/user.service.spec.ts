import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { MailService } from 'src/mail/mail.service';
import { Repository } from 'typeorm';
import { UserEntity } from './entities/user.entity';
import { Verification } from './entities/verification.entity';
import { UserResolver } from './user.resolver';
import { UserService } from './user.service';

const mockRepository = () => ({
  findOne: jest.fn(),
  save: jest.fn(),
  create: jest.fn(),
  findOneOrFail: jest.fn(),
  delete: jest.fn(),
});

const mockJwtService = {
  sign: jest.fn(() => 'signed-token-test'),
  verify: jest.fn(),
};

const mockMailService = {
  sendVerificationEmail: jest.fn(),
};

type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

describe('UserService', () => {
  let service: UserService;
  let usersRepository: MockRepository<UserEntity>;
  let jwtService: JwtService;
  let verificationRepository: MockRepository<Verification>;
  let mailService: MailService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockRepository(),
        },
        {
          provide: getRepositoryToken(Verification),
          useValue: mockRepository(),
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mailService = module.get<MailService>(MailService);
    jwtService = module.get<JwtService>(JwtService);
    usersRepository = module.get(getRepositoryToken(UserEntity));
    verificationRepository = module.get(getRepositoryToken(Verification));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('createAccount', () => {
    const createAccountArgs = {
      email: 'user@visual.camp',
      password: 'test-password',
      role: 0,
    };

    it('should fail if the email exists', async () => {
      // fake existing user
      usersRepository.findOne.mockResolvedValue({
        id: 1,
        email: 'user@visual.camp',
      });
      const result = await service.createAccount(createAccountArgs);
      expect(result).toMatchObject({
        ok: false,
        message: `Duplicate email exists user@visual.camp`,
      });
    });

    it('should create a new user', async () => {
      usersRepository.findOne.mockReturnValue(undefined);
      usersRepository.create.mockReturnValue(createAccountArgs);
      usersRepository.save.mockResolvedValue(createAccountArgs);
      verificationRepository.create.mockReturnValue({
        user: createAccountArgs,
      });
      verificationRepository.save.mockResolvedValue({
        code: 'test',
      });
      verificationRepository.create.mockReturnValue(createAccountArgs);

      const result = await service.createAccount(createAccountArgs);

      expect(usersRepository.create).toHaveBeenCalledTimes(1);
      expect(usersRepository.create).toHaveBeenCalledWith(createAccountArgs);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(createAccountArgs);

      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: createAccountArgs,
      });

      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(
        createAccountArgs,
      );

      expect(mailService.sendVerificationEmail).toHaveBeenCalledTimes(1);
      expect(mailService.sendVerificationEmail).toHaveBeenCalledWith({
        code: expect.any(String),
        recipient: expect.any(String),
      });

      expect(result).toEqual({
        ok: true,
        message: 'Successfully created account user@visual.camp',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('mock error'));
      const result = await service.createAccount(createAccountArgs);
      expect(result).toEqual({
        ok: false,
        message: 'Failed to create account',
        error: new Error('mock error'),
      });
    });
  });

  describe('login', () => {
    const loginArgs = {
      email: 'test@visual.camp',
      password: 'testestest',
    };
    it('should fail if the user does not exist', async () => {
      usersRepository.findOne.mockResolvedValue(null);
      const result = await service.login(loginArgs);

      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(result).toEqual({
        ok: false,
        message: `No user with test@visual.camp not found`,
      });
    });
    it('should fail if password is wrong', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(false)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(result).toEqual({ ok: false, message: 'Password is incorrect' });
    });

    it('should return token if password is correct', async () => {
      const mockedUser = {
        id: 1,
        checkPassword: jest.fn(() => Promise.resolve(true)),
      };

      usersRepository.findOne.mockResolvedValue(mockedUser);
      const result = await service.login(loginArgs);
      expect(jwtService.sign).toHaveBeenCalledTimes(1);
      expect(jwtService.sign).toHaveBeenCalledWith({ id: 1 });
      expect(result).toEqual({
        ok: true,
        message: `Successfully logged in test@visual.camp`,
        token: 'signed-token-test',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('mock error'));
      const result = await service.login(loginArgs);
      expect(result).toEqual({
        ok: false,
        message: 'Failed to login',
        error: new Error('mock error'),
      });
    });
  });

  describe('findById', () => {
    const args = 1;
    it('should return an existing user', async () => {
      usersRepository.findOne.mockResolvedValue({ id: 1 });
      const result = await service.findById(args);
      expect(result).toEqual({ id: 1 });
    });
  });

  describe('editProfile', () => {
    it('should change email', async () => {
      const oldUser = {
        id: 1,
        email: 'test@visual.camp',
        password: 'test-password',
        verified: true,
      };
      const editProfileArgs = {
        id: 1,
        editProfileInput: {
          email: 'test2@visual.camp',
        },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        id: 1,
        email: 'test2@visual.camp',
        password: 'test-password',
        verified: false,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      const result = await service.editProfile(
        editProfileArgs.id,
        editProfileArgs.editProfileInput,
      );
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(verificationRepository.create).toHaveBeenCalledTimes(1);
      expect(verificationRepository.create).toHaveBeenCalledWith({
        user: newUser,
      });
      expect(verificationRepository.save).toHaveBeenCalledTimes(1);
      expect(verificationRepository.save).toHaveBeenCalledWith(newVerification);

      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({
        ok: true,
        message: 'User profile edited',
      });
    });

    it.todo('send verification email');
    it('should change password', async () => {
      const oldUser = {
        id: 1,
        email: 'test@visual.camp',
        password: 'test-password',
        verified: true,
      };
      const editProfileArgs = {
        id: 1,
        editProfileInput: {
          password: 'new-password',
        },
      };
      const newVerification = {
        code: 'code',
      };
      const newUser = {
        id: 1,
        email: 'test@visual.camp',
        password: 'new-password',
        verified: true,
      };

      usersRepository.findOne.mockResolvedValue(oldUser);
      verificationRepository.create.mockReturnValue(newVerification);
      verificationRepository.save.mockResolvedValue(newVerification);

      const result = await service.editProfile(
        editProfileArgs.id,
        editProfileArgs.editProfileInput,
      );
      expect(usersRepository.findOne).toHaveBeenCalledTimes(1);
      expect(usersRepository.findOne).toHaveBeenCalledWith({ id: 1 });
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith(newUser);
      expect(result).toEqual({
        ok: true,
        message: 'User profile edited',
      });
    });

    it('should fail on exception', async () => {
      usersRepository.findOne.mockRejectedValue(new Error('failed message'));
      const result = await service.editProfile(1, { email: 'test' });
      expect(result).toEqual({
        ok: false,
        message: 'Failed to edit profile',
        error: new Error('failed message'),
      });
    });
  });

  describe('verifyEmail', () => {
    it('should verify email', async () => {
      const input = {
        code: 'test-code',
      };
      const mockedVerification = {
        user: {
          verified: false,
        },
        id: 1,
      };

      verificationRepository.findOne.mockResolvedValue(mockedVerification);
      const result = await service.verifyEmail(input);

      expect(verificationRepository.findOne).toHaveBeenCalledTimes(1);
      expect(verificationRepository.findOne).toHaveBeenCalledWith(
        expect.any(Object),
        expect.any(Object),
      );
      expect(usersRepository.save).toHaveBeenCalledTimes(1);
      expect(usersRepository.save).toHaveBeenCalledWith({ verified: true });
      expect(verificationRepository.delete).toHaveBeenCalledTimes(1);
      expect(verificationRepository.delete).toHaveBeenCalledWith(
        mockedVerification.id,
      );
      expect(result).toEqual({ ok: true, message: 'Verified!' });
    });

    it('should fail on verification not found', async () => {
      const input = {
        code: 'test-code',
      };

      verificationRepository.findOne.mockResolvedValue(undefined);
      const result = await service.verifyEmail(input);
      expect(result).toEqual({ ok: false, message: 'Verification is invalid' });
    });

    it('should fail on exception', async () => {
      const input = {
        code: 'test-code',
      };

      verificationRepository.findOne.mockRejectedValue(new Error('test error'));
      const result = await service.verifyEmail(input);
      expect(result).toEqual({
        ok: false,
        message: 'Verfication failed',
        error: new Error('test error'),
      });
    });
  });
});
