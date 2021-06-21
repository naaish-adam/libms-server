import { Field, Int, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { Common } from "./Common";
import { Copy } from "./Copy";

@ObjectType()
@Entity()
export class Book extends Common {
  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  isbn: number;

  @Field()
  @Column()
  name: string;

  @Field()
  @Column()
  author: string;

  @Field()
  @Column()
  publishedDate: Date;

  @Field({ nullable: true })
  @Column({ nullable: true })
  cover: string;

  @Field(() => [Copy])
  @OneToMany(() => Copy, (copy) => copy.book)
  copies: Copy[];
}
