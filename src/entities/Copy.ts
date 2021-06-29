import { Field, ObjectType, registerEnumType } from "type-graphql";
import { Column, Entity, ManyToOne } from "typeorm";
import { Book } from "./Book";
import { Common } from "../abstract/Common";

export enum CopyStatus {
  AVAILABLE = "Available",
  RESERVED = "Reserved",
  CHECKED_OUT = "Checked Out",
}

registerEnumType(CopyStatus, {
  name: "CopyStatus",
  description: "The status of a copy",
});

@ObjectType()
@Entity()
export class Copy extends Common {
  @Field()
  @Column()
  rackNo: string;

  @Field(() => CopyStatus)
  @Column()
  status: CopyStatus;

  @Field(() => Book)
  @ManyToOne(() => Book, (book) => book.id, { onDelete: "CASCADE" })
  book: Book;
}
