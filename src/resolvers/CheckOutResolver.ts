import { CheckOut } from "../entities/CheckOut";
import {
  CheckOutsConnectionArgs,
  PaginatedCheckOuts,
} from "../pagination/CheckOuts";
import { connectionFromArraySlice } from "../pagination/ConnectionArgs";
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
import {
  EntityManager,
  getConnection,
  Transaction,
  TransactionManager,
} from "typeorm";
import { Copy, CopyStatus } from "../entities/Copy";
import { addDays } from "../utils/helpers";
import { User } from "../entities/User";

@InputType()
class CheckOutBookInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => Int)
  borrowerId: number;
}

@ObjectType()
class CheckOutBookResponse {
  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  checkOut?: CheckOut;
}

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

    const [bookList, count] = await CheckOut.findAndCount({
      skip: offset,
      take: realLimitPlusOne,
      where: {
        returned: filter.returned,
        borrower: { id: filter?.userId },
      },
      order: {
        createdAt: "DESC",
      },
      relations: ["copy", "copy.book", "borrower"],
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

  @Mutation(() => Boolean)
  @Transaction()
  async returnBook(
    @TransactionManager() manager: EntityManager,
    @Arg("id", () => Int) id: number
  ) {
    const checkOut = await CheckOut.findOne(id, { relations: ["copy"] });

    if (!checkOut) {
      return false;
    }

    manager.update(Copy, checkOut.copy.id, { status: CopyStatus.AVAILABLE });
    manager.update(CheckOut, id, { returned: true });

    return true;
  }

  @Mutation(() => CheckOutBookResponse)
  @Transaction()
  async checkOutBook(
    @TransactionManager() manager: EntityManager,
    @Arg("checkOutBookInput")
    checkOutBookInput: CheckOutBookInput
  ): Promise<CheckOutBookResponse> {
    const { bookId, borrowerId } = checkOutBookInput;

    // check if a copy of the book already checked out
    const checkOut = await getConnection()
      .createQueryBuilder(CheckOut, "checkOut")
      .leftJoinAndSelect("checkOut.copy", "copy")
      .leftJoinAndSelect("copy.book", "book")
      .where("checkOut.borrowerId = :borrowerId", { borrowerId })
      .andWhere("book.id = :bookId", { bookId })
      .andWhere("checkOut.returned = :returned", { returned: false })
      .getOne();

    if (checkOut) {
      return {
        error: "You already have a copy of this book borrowed.",
      };
    }

    const borrower = await User.findOne(borrowerId);

    // check if a copy is available
    const copy = await Copy.findOne({
      where: { book: { id: bookId }, status: CopyStatus.AVAILABLE },
    });

    if (!copy) {
      return {
        error: "No copies for that book available",
      };
    }

    // check if member has reached limit
    const checkOuts = await CheckOut.find({
      where: { borrower: { id: borrowerId }, returned: false },
    });

    if (checkOuts.length > 4) {
      return {
        error: "Check out limit reached. Return a book to check out another.",
      };
    }

    const newCheckOut = new CheckOut();
    newCheckOut.borrower = borrower as User;
    newCheckOut.copy = copy;
    newCheckOut.dueAt = addDays(new Date(), 20);

    manager.update(Copy, copy.id, { status: CopyStatus.CHECKED_OUT });

    return {
      checkOut: await manager.save(newCheckOut),
    };
  }
}
