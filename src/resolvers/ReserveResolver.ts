import {
  PaginatedReserves,
  ReservesConnectionArgs,
} from "../pagination/Reserves";
import {
  Arg,
  Args,
  Field,
  FieldResolver,
  InputType,
  Int,
  Mutation,
  ObjectType,
  Query,
  Resolver,
  Root,
} from "type-graphql";
import { Reserve } from "../entities/Reserve";
import { connectionFromArraySlice } from "../pagination/ConnectionArgs";
import { Copy, CopyStatus } from "../entities/Copy";
import { User } from "../entities/User";
import { Book } from "../entities/Book";

@InputType()
class ReserveBookInput {
  @Field(() => Int)
  bookId: number;

  @Field(() => Int)
  reserverId: number;
}

@ObjectType()
class ReserveBookResponse {
  @Field({ nullable: true })
  error?: string;

  @Field({ nullable: true })
  reserve?: Reserve;
}

@Resolver(Reserve)
export class ReserveResolver {
  @FieldResolver()
  async book(@Root() reserve: Reserve) {
    return await Book.findOne(reserve.book);
  }

  @FieldResolver()
  async reserver(@Root() reserve: Reserve) {
    return await User.findOne(reserve.reserver);
  }

  @Query(() => PaginatedReserves)
  async reserves(
    @Args() args: ReservesConnectionArgs
  ): Promise<PaginatedReserves> {
    const { limit, offset } = args.pagingParams();
    const { filter } = args;

    const realOffset = offset || 0;
    const realLimit = Math.min(50, limit || 50);
    const realLimitPlusOne = realLimit + 1;

    const [bookList, count] = await Reserve.findAndCount({
      skip: offset,
      take: realLimitPlusOne,
      order: {
        createdAt: "DESC",
      },
      where: {
        active: filter.active,
        reserver: { id: filter.userId },
      },
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

  @Mutation(() => ReserveBookResponse)
  async reserveBook(
    @Arg("reserveBookInput")
    reserveBookInput: ReserveBookInput
  ) {
    // Get all copies of the book
    const copies = await Copy.find({
      where: {
        book: { id: reserveBookInput.bookId },
      },
    });

    if (copies.length === 0) {
      return {
        error: "No copies of the book exist.",
      };
    }

    // Check if a copy already available
    const availableCopy = copies.find(
      (copy) => copy.status === CopyStatus.AVAILABLE
    );

    if (availableCopy) {
      return {
        error: "An available copy of the book already exists.",
      };
    }

    // All copies checked_out / reserved

    // Check if reserve limit reached
    const currentReserves = await Reserve.find({
      where: { reserver: { id: reserveBookInput.reserverId }, active: true },
    });

    if (currentReserves.length > 4) {
      return {
        error: "You have reached your reserve limit.",
      };
    }

    const latestReserve = await Reserve.findOne({
      where: { active: true, book: { id: reserveBookInput.bookId } },
      order: { createdAt: "DESC" },
    });

    const newReserve = new Reserve();
    newReserve.reserver = (await User.findOne(
      reserveBookInput.reserverId
    )) as User;
    newReserve.book = await copies.find(
      (copy) => copy.status !== CopyStatus.AVAILABLE
    )!.book;
    newReserve.active = true;
    newReserve.position = latestReserve ? latestReserve.position + 1 : 1;

    return {
      reserve: await Reserve.create(newReserve).save(),
    };
  }
}
