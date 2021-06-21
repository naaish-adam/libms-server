import { CheckOut } from "../entities/CheckOut";
import {
  CheckOutsConnectionArgs,
  PaginatedCheckOuts,
} from "../pagination/CheckOuts";
import { connectionFromArraySlice } from "../pagination/ConnectionArgs";
import { Args, Query, Resolver } from "type-graphql";
import { ILike } from "typeorm";

@Resolver()
export class CheckOutResolver {
  @Query(() => PaginatedCheckOuts)
  async checkOuts(
    @Args() args: CheckOutsConnectionArgs
  ): Promise<PaginatedCheckOuts> {
    const { limit, offset } = args.pagingParams();
    const { filter } = args;

    const realOffset = offset || 0;
    const realLimit = Math.min(50, limit || 50);
    const realLimitPlusOne = realLimit + 1;

    const where = filter?.searchTerm
      ? [
          {
            name: ILike(`%${filter.searchTerm}%`),
          },
          {
            author: ILike(`%${filter.searchTerm}%`),
          },
          {
            isbn: ILike(`%${filter.searchTerm}%`),
          },
        ]
      : undefined;

    const [bookList, count] = await CheckOut.findAndCount({
      skip: offset,
      take: realLimitPlusOne,
      where,
    });

    const { edges, pageInfo } = connectionFromArraySlice(
      bookList.slice(0, realLimit),
      args,
      {
        arrayLength: count,
        sliceStart: realOffset,
      }
    );

    return {
      edges,
      pageInfo: {
        ...pageInfo,
        hasNextPage: realOffset + realLimit < count,
        hasPreviousPage: realOffset >= realLimit,
      },
    };
  }

  @Query(() => String)
  checkOut() {
    return "hello world";
  }
}
