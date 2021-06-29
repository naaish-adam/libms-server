import { Reserve } from "../entities/Reserve";
import { ArgsType, Field, InputType, ObjectType } from "type-graphql";
import ConnectionArgs from "./ConnectionArgs";
import RelayTypes from "./RelayTypes";

@ObjectType()
export class PaginatedReserves extends RelayTypes<Reserve>(Reserve) {}

@InputType()
export default class ReservesFilterInput {
  @Field({ nullable: true })
  userId?: number;

  @Field()
  active: boolean;
}

@ArgsType()
export class ReservesConnectionArgs extends ConnectionArgs {
  @Field()
  filter: ReservesFilterInput;
}
