import { CheckOut } from "../entities/CheckOut";
import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import ConnectionArgs from "./ConnectionArgs";
import RelayTypes from "./RelayTypes";

@ObjectType()
export class PaginatedCheckOuts extends RelayTypes<CheckOut>(CheckOut) {}

@InputType()
export default class CheckOutsFilterInput {
  @Field({ nullable: true })
  searchTerm?: string;
}

@ArgsType()
export class CheckOutsConnectionArgs extends ConnectionArgs {
  @Field({ nullable: true })
  filter?: CheckOutsFilterInput;
}
