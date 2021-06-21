import {
  Arg,
  Field,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { User, UserRole } from "../entities/User";

@ObjectType()
class LoginResponse {
  @Field(() => User, { nullable: true })
  user?: User;

  @Field(() => String, { nullable: true })
  error?: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User)
  async me() {
    return await User.findOne({ username: "abraham" });
  }

  @Mutation(() => String)
  async register(
    @Arg("username") username: string,
    @Arg("password") password: string,
    @Arg("role", () => UserRole) role: UserRole
  ) {
    await User.create({
      username,
      password,
      role,
    }).save();

    return "User Registered!";
  }

  @Mutation(() => LoginResponse)
  async login(
    @Arg("username") username: string,
    @Arg("password") password: string
  ): Promise<LoginResponse> {
    const user = await User.findOne({ username });

    if (!user || password !== user.password) {
      return {
        error: "Invalid username or password",
      };
    }

    return {
      user,
    };
  }
}
