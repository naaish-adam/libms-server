import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import { Book } from "../entities/Book";
import ConnectionArgs from "./ConnectionArgs";
import RelayTypes from "./RelayTypes";

@ObjectType()
export class PaginatedBooks extends RelayTypes<Book>(Book) {}

@InputType()
export default class BooksFilterInput {
  @Field({ nullable: true })
  searchTerm?: string;

  @Field({ nullable: true })
  onlyAvailable?: boolean;
}

@ArgsType()
export class BooksConnectionArgs extends ConnectionArgs {
  @Field({ nullable: true })
  filter?: BooksFilterInput;
}
