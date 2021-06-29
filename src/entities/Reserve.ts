import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Book } from "./Book";
import { Common } from "../abstract/Common";
import { User } from "./User";

@ObjectType()
@Entity()
export class Reserve extends Common {
  @Field(() => User)
  @ManyToOne(() => User, (user) => user.reserves)
  reserver: User;

  @Field(() => Book)
  @ManyToOne(() => Book, (book) => book.reserves)
  book: Book;

  @Field(() => Int)
  @Column()
  position: number;

  @Field()
  @Column()
  active: boolean;
}
