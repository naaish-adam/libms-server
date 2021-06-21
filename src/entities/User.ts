import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Column, Entity } from "typeorm";
import { Common } from "./Common";

export enum UserRole {
  LIBRARIAN = "librarian",
  MEMBER = "member",
}

registerEnumType(UserRole, {
  name: "UserRole",
  description: "The role of user",
});

@ObjectType()
@Entity()
export class User extends Common {
  @Field()
  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Field(() => UserRole)
  @Column()
  role: UserRole;
}
