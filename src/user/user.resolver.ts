import { UseGuards } from '@nestjs/common';
import { Resolver, Query, Args, Mutation } from '@nestjs/graphql';
import { AuthUser } from 'src/auth/auth-user.decorator';
import { AuthGuard } from 'src/auth/auth.guard';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';
import { UserProfileInput, UserProfileOutput } from './dto/user-profile.dto';
import { VerifyEmailInput, VerifyEmailOutput } from './dto/verify-email.dto';
import { UserEntity as User } from './entities/user.entity';
import { UserService } from './user.service';

@Resolver(() => User)
export class UserResolver {
  constructor(private readonly usersService: UserService) {}

  /**
   * Create user account.
   * @param {CreateAccountInput} createAccountInput
   * @returns {Promise<CreateAccountOutput>}
   */
  @Mutation(() => CreateAccountOutput)
  createAccount(
    @Args('input') createAccountInput: CreateAccountInput,
  ): Promise<CreateAccountOutput> {
    return this.usersService.createAccount(createAccountInput);
  }

  /**
   * Login the user.
   * @param {LoginInput} loginInput
   * @returns {Promise<LoginOutput>}
   */
  @Mutation(() => LoginOutput)
  login(@Args('input') loginInput: LoginInput): Promise<LoginOutput> {
    return this.usersService.login(loginInput);
  }

  /**
   * Query user profile
   * @param {UserProfileInput} userProfileInput
   * @returns {Promise<UserProfileOutput>}
   */
  @Query(() => UserProfileOutput)
  @UseGuards(AuthGuard)
  userProfile(
    @Args('input') userProfileInput: UserProfileInput,
  ): Promise<UserProfileOutput> {
    return this.usersService.queryUserProfile(userProfileInput);
  }

  /**
   * Edit user profile
   * @param {User} authUser
   * @param {EditProfileInput} editProfileInput
   * @returns {Promise<UserProfileOutput>}
   */
  @Mutation(() => EditProfileOutput)
  @UseGuards(AuthGuard)
  editProfile(
    @AuthUser() authUser: User,
    @Args('input') editProfileInput: EditProfileInput,
  ): Promise<EditProfileOutput> {
    return this.usersService.editProfile(authUser.id, editProfileInput);
  }

  /**
   * verify user email
   * @param {VerifyEmailInput} verifyEmailInput
   * @returns {Promise<VerifyEmailOutput>}
   */
  @Mutation(() => VerifyEmailOutput)
  verifyEmail(
    @Args('input') verifyEmailInput: VerifyEmailInput,
  ): Promise<VerifyEmailOutput> {
    return this.usersService.verifyEmail(verifyEmailInput);
  }
}
