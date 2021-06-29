import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { CheckOut } from "./CheckOut";
import { Common } from "./Common";
import { Reserve } from "./Reserve";

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

  @OneToMany(() => CheckOut, (checkOut) => checkOut.borrower)
  checkOuts: CheckOut[];

  @OneToMany(() => Reserve, (reserve) => reserve.reserver)
  reserves: Reserve[];
}
