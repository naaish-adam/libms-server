import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import { Book } from "../entities/Book";
import ConnectionArgs from "./ConnectionArgs";
import RelayTypes from "./RelayTypes";

@ObjectType()
export class PaginatedBooks extends RelayTypes<Book>(Book) {}

// @ArgsType()
// export class BooksFilterArgs {
//   @Field({ nullable: true })
//   name?: string;
// }

@InputType()
export default class BooksFilterInput {
  @Field({ nullable: true })
  searchTerm?: string;
}

@ArgsType()
export class BooksConnectionArgs extends ConnectionArgs {
  @Field({ nullable: true })
  filter?: BooksFilterInput;
}
