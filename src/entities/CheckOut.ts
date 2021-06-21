import { ObjectType } from "type-graphql";
import { Column, Entity, JoinColumn, OneToOne } from "typeorm";
import { Common } from "./Common";
import { Copy } from "./Copy";
import { User } from "./User";

@ObjectType()
@Entity()
export class CheckOut extends Common {
  @OneToOne(() => User)
  @JoinColumn()
  borrower: User;

  @OneToOne(() => Copy)
  @JoinColumn()
  copy: Copy;

  @Column()
  dueAt: Date;
}
