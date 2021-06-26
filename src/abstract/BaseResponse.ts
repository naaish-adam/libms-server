import { Field, ObjectType } from "type-graphql";

@ObjectType()
export abstract class BaseResponse {
  @Field({ nullable: true })
  error?: string;
}
