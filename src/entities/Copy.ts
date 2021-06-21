import { Field, ObjectType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Book } from "./Book";
import { Common } from "./Common";

@ObjectType()
@Entity()
export class Copy extends Common {
  @Field()
  @Column()
  rackNo: string;

  @ManyToOne(() => Book, (book) => book.id)
  book: Book;
}
