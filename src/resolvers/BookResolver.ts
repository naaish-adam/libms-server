import {
  Arg,
  Args,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { getConnection } from "typeorm";

import { Book } from "../entities/Book";
import { Copy, CopyStatus } from "../entities/Copy";

import { BooksConnectionArgs, PaginatedBooks } from "../pagination/Books";
import { connectionFromArraySlice } from "../pagination/ConnectionArgs";

@InputType()
class BookInput {
  @Field(() => Int, { nullable: true })
  id?: number;

  @Field({ nullable: true })
  isbn?: string;

  @Field()
  name!: string;

  @Field()
  author!: string;

  @Field()
  publishedDate!: Date;

  @Field({ nullable: true })
  cover?: string;
}

@Resolver(Book)
export class BookResolver {
  @FieldResolver()
  async copies(@Root() book: Book) {
    return await Copy.find({ where: { book } });
  }

  @Query(() => PaginatedBooks)
  async books(@Args() args: BooksConnectionArgs): Promise<PaginatedBooks> {
    const { limit, offset } = args.pagingParams();
    const { filter } = args;

    const realOffset = offset || 0;
    const realLimit = Math.min(50, limit || 50);
    const realLimitPlusOne = realLimit + 1;

    const query = getConnection()
      .createQueryBuilder(Book, "book")
      .leftJoinAndSelect("book.copies", "copy");

    if (filter?.searchTerm) {
      query
        .where("book.name like :name", { name: `%${filter.searchTerm}%` })
        .orWhere("book.author like :author", {
          author: `%${filter.searchTerm}%`,
        })
        .orWhere("book.isbn like :isbn", { isbn: `%${filter.searchTerm}%` });
    }

    if (filter?.onlyAvailable) {
      query.andWhere("copy.status = :status", { status: CopyStatus.AVAILABLE });
    }

    const [bookList, count] = await query
      .skip(offset)
      .take(realLimitPlusOne)
      .orderBy("book.createdAt", "DESC")
      .getManyAndCount();

    // const where = filter?.searchTerm
    // ? [
    //     {
    //       name: ILike(`%${filter.searchTerm}%`),
    //     },
    //     {
    //       author: ILike(`%${filter.searchTerm}%`),
    //     },
    //     {
    //       isbn: ILike(`%${filter.searchTerm}%`),
    //     },
    //   ]
    // : undefined;

    // const [bookList, count] = await Book.findAndCount({
    //   skip: offset,
    //   take: realLimitPlusOne,
    //   where,
    //   order: { createdAt: "DESC" },
    // });

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
  async addBook(@Arg("bookInput") bookInput: BookInput): Promise<Book> {
    return await Book.create(bookInput).save();
  }

  @Mutation(() => Book)
  async updateBook(@Arg("bookInput") bookInput: BookInput): Promise<Book> {
    await Book.update(bookInput.id as number, bookInput);
    return (await Book.findOne(bookInput.id)) as Book;
  }

  @Mutation(() => Boolean)
  async deleteBook(@Arg("id", () => Int) id: number) {
    await Book.delete(id);
    return true;
  }
}
