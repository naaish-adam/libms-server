import { Copy } from "../entities/Copy";
import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import ConnectionArgs from "./ConnectionArgs";
import RelayTypes from "./RelayTypes";

@ObjectType()
export class PaginatedCopies extends RelayTypes<Copy>(Copy) {}

@InputType()
export default class CopiesFilterInput {
  @Field({ nullable: true })
  searchTerm?: string;
}

@ArgsType()
export class CopiesConnectionArgs extends ConnectionArgs {
  @Field({ nullable: true })
  filter?: CopiesFilterInput;
}
