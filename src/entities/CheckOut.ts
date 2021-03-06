import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Common } from "../abstract/Common";
import { Copy } from "./Copy";
import { User } from "./User";

@ObjectType()
@Entity()
export class CheckOut extends Common {
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.checkOuts)
  borrower: User;

  @Field(() => Copy)
  @ManyToOne(() => Copy, (copy) => copy.checkOuts)
  copy: Copy;

  @Field()
  @Column({ default: false })
  returned: boolean = false;

  @Field(() => Date)
  @Column()
  dueAt: Date;
}
