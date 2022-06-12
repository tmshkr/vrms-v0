import { createServer } from "@graphql-yoga/node";
import prisma from "lib/prisma";

const typeDefs = /* GraphQL */ `
  type Query {
    users: [User!]!
    projects: [Project!]
    meetings: [Meeting!]
  }
  type User {
    slack_id: String
  }
  type Project {
    id: Int
    created_by: String
    is_active: Boolean
    name: String
  }

  type Meeting {
    id: Int
    created_by: String
    duration: Int
    is_active: Boolean
    project_id: Int
    rrule: String
    slack_channel_id: String
    start_date: String
    title: String
  }
`;

const resolvers = {
  Query: {
    users(parent, args, context) {
      return prisma.user.findMany({ where: {} });
    },
    projects(parent, args, context) {
      return prisma.project.findMany({ where: {} });
    },
    meetings(parent, args, context) {
      return prisma.meeting.findMany({ where: {} });
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
