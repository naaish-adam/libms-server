import "reflect-metadata";

import express from "express";
import cors from "cors";

import { graphqlHTTP } from "express-graphql";
import { buildSchema } from "type-graphql";
import { createConnection } from "typeorm";

import { HelloResolver } from "./resolvers/HelloResolver";
import { UserResolver } from "./resolvers/UserResolver";
import { BookResolver } from "./resolvers/BookResolver";
import { CopyResolver } from "./resolvers/CopyResolver";
import { CheckOutResolver } from "./resolvers/CheckOutResolver";
import { ReserveResolver } from "./resolvers/ReserveResolver";

const PORT = 4000;

const main = async () => {
  await createConnection();

  const app = express();

  app.use(
    cors({
      origin: "http://localhost:3000",
      credentials: true,
    })
  );

  app.use(
    "/",
    graphqlHTTP({
      schema: await buildSchema({
        resolvers: [
          HelloResolver,
          UserResolver,
          BookResolver,
          CopyResolver,
          CheckOutResolver,
          ReserveResolver,
        ],
        dateScalarMode: "timestamp",
      }),
      graphiql: true,
    })
  );

  app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}...`);
  });
};

main();
