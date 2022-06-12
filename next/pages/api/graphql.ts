import { createServer } from "@graphql-yoga/node";
import prisma from "lib/prisma";

const typeDefs = /* GraphQL */ `
  type Query {
    users: [User!]!
  }
  type User {
    slack_id: String
  }
`;

const resolvers = {
  Query: {
    async users(parent, args, context) {
      const users = await prisma.user.findMany({ where: {} });
      return users;
    },
  },
};

const server = createServer({
  schema: {
    typeDefs,
    resolvers,
  },
  endpoint: "/api/graphql",
  graphiql: true,
});

export default server;
