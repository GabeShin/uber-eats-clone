import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from 'src/jwt/jwt.service';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { UserEntity as User, UserEntity } from './entities/user.entity';
import { Verification } from './entities/verification.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Verification)
    private readonly verifications: Repository<Verification>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Create user account. Save UserEntity into User Repository.
   * @param {CreateAccountInput} createAccountInput
   * @returns {CreateAccountOutput}
   */
  async createAccount(
    createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    try {
      const { email, password, role } = createAccountInput;
      const exists = await this.users.findOne({ email: email });

      if (exists) {
        return {
          ok: false,
          message: `Duplicate email exists ${email}`,
        };
      }

      const user = await this.users.save(
        this.users.create({
          email,
          password,
          role,
        }),
      );

      await this.verifications.save(
        this.verifications.create({
          user,
        }),
      );

      return {
        ok: true,
        message: `Successfully created account ${email}`,
      };
    } catch (error) {
      return {
        ok: false,
        message: 'Failed to create account',
        error: error,
      };
    }
    // create user & hash the password
  }

  /**
   * Login user
   * @param {LoginInput} loginInput
   * @returns {Promise<LoginOutput>}
   */
  async login(loginInput: LoginInput): Promise<LoginOutput> {
    try {
      const { email, password } = loginInput;
      const user = await this.users.findOne(
        { email },
        { select: ['id', 'password'] },
      );

      if (!user) {
        return {
          ok: false,
          message: `No user with ${email} not found`,
        };
      }

      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          message: 'Password is incorrect',
        };
      }
      const token = this.jwtService.sign({ id: user.id });

      return {
        ok: true,
        message: `Successfully logged in ${email}`,
        token: token,
      };
    } catch (error) {
      return {
        ok: false,
        message: 'Failed to login',
        error: error,
      };
    }
  }

  /**
   * Find and return user profile
   * @param {UserProfileInput } userProfileInput
   * @returns {Promise<UserProfileOutput>}
   */
  async queryUserProfile(
    userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    try {
      const { userId } = userProfileInput;
      const user = await this.findById(userId);
      if (!user) {
        return {
          ok: false,
          message: `Failed to find user ${userProfileInput.userId}`,
        };
      }
      return {
        ok: true,
        message: 'Successfully retrieve user profile',
        user: user,
      };
    } catch (error) {
      return {
        ok: false,
        message: `Failed to find user profile`,
        error: error,
      };
    }
  }

  /**
   * Find user using userId
   * @param {number} id
   * @returns {UserEntity}
   */
  async findById(id: number) {
    return this.users.findOne({ id });
  }

  /**
   * Edit user Profile
   * @param {number} userId
   * @param {EditProfileInput} editProfileInput
   * @returns {Promise<EditProfileOutput>}
   */
  async editProfile(
    userId: number,
    editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    try {
      const { email, password } = editProfileInput;
      const user = await this.findById(userId);
      if (email) {
        user.email = email;
        user.verified = false;
        await this.verifications.save(this.verifications.create({ user }));
      }
      if (password) {
        user.password = password;
      }
      await this.users.save(user);
      return {
        ok: true,
        message: 'User profile edited',
      };
    } catch (error) {
      return {
        ok: false,
        message: 'Failed to edit profile',
        error: error,
      };
    }
  }

  /**
   * Verify user email
   * @param {VerifyEmailInput} verifyEmailInput
   * @returns {Promise<VerifyEmailOutput>}
   */
  async verifyEmail(
    verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    try {
      const { code } = verifyEmailInput;
      const verification = await this.verifications.findOne(
        { code },
        { relations: ['user'] },
      );
      if (!verification) {
        return {
          ok: false,
          message: 'Verification is invalid',
        };
      }

      const user = verification.user;
      user.verified = true;
      await this.users.save(user);
      await this.verifications.delete(verification.id);

      return {
        ok: true,
        message: 'Verified!',
      };
    } catch (error) {
      return {
        ok: false,
        message: 'Verfication failed',
        error: error,
      };
    }
  }
}
