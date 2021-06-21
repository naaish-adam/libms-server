import { Book } from "../entities/Book";
import {
  Arg,
  Args,
  Field,
  InputType,
  Mutation,
  Query,
  Resolver,
} from "type-graphql";
import { connectionFromArraySlice } from "../pagination/ConnectionArgs";
import { BooksConnectionArgs, PaginatedBooks } from "../pagination/Books";
import { ILike } from "typeorm";

@InputType()
class BookInput {
  @Field({ nullable: true })
  isbn: number;

  @Field()
  name: string;

  @Field()
  author: string;

  @Field()
  publishedDate: Date;

  @Field({ nullable: true })
  cover: string;
}

@Resolver()
export class BookResolver {
  @Query(() => PaginatedBooks)
  async books(@Args() args: BooksConnectionArgs): Promise<PaginatedBooks> {
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

    const [bookList, count] = await Book.findAndCount({
      skip: offset,
      take: realLimitPlusOne,
      where,
    });

    console.log(bookList.slice(0, realLimit));

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

  @Query(() => Book)
  async book(@Arg("id") id: number) {
    return await Book.findOne(id);
  }

  @Mutation(() => Book)
  async addBook(@Arg("bookInput") bookInput: BookInput) {
    return await Book.create(bookInput).save();
  }
}
