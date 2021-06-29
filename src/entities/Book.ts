import { Field, ObjectType } from "type-graphql";
import { Column, Entity, OneToMany } from "typeorm";
import { Common } from "../abstract/Common";
import { Copy } from "./Copy";
import { Reserve } from "./Reserve";

@ObjectType()
@Entity()
export class Book extends Common {
  @Field({ nullable: true })
  @Column({ nullable: true, length: 13 })
  isbn: string;

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

  @OneToMany(() => Reserve, (reserve) => reserve.book)
  reserves: Reserve[];
}
