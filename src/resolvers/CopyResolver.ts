import { Copy, CopyStatus } from "../entities/Copy";
import { connectionFromArraySlice } from "../pagination/ConnectionArgs";
import { CopiesConnectionArgs, PaginatedCopies } from "../pagination/Copies";
import {
  Arg,
  Args,
  Field,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { ILike } from "typeorm";
import { Book } from "../entities/Book";
import { BaseResponse } from "../abstract/BaseResponse";

@InputType()
class CopyInput {
  @Field()
  rackNo: string;

  @Field(() => CopyStatus)
  status: CopyStatus;

  @Field(() => Int)
  bookId: number;
}

@ObjectType()
class CopyResponse extends BaseResponse {
  @Field()
  copy?: Copy;
}
@Resolver(Copy)
export class CopyResolver {
  @Query(() => PaginatedCopies)
  async copies(@Args() args: CopiesConnectionArgs): Promise<PaginatedCopies> {
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

    const [bookList, count] = await Copy.findAndCount({
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

  @Query(() => Copy)
  async copy(@Arg("id", () => Int) id: number) {
    return await Copy.findOne(id);
  }

  @Mutation(() => CopyResponse)
  async addCopy(@Arg("copyInput") copyInput: CopyInput): Promise<CopyResponse> {
    const book = await Book.findOne(copyInput.bookId);

    if (!book) {
      return {
        error: "A book with that id doesn't exist",
      };
    }

    return { copy: await Copy.create({ ...copyInput, book }).save() };
  }
}
