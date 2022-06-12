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
    meetings: [Meeting!]
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
      console.log("Query.users", { parent, args });
      return prisma.user.findMany({
        where: {},
      });
    },
    projects(parent, args, context) {
      console.log("Query.projects", { parent, args });
      return prisma.project.findMany({ where: {} });
    },
    meetings(parent, args, context) {
      console.log("Query.meetings", { parent, args });
      return prisma.meeting.findMany({ where: {} });
    },
  },
  User: {
    meetings(parent, args, context) {
      console.log("User.meetings", { parent, args });
      return prisma.meetingParticipant
        .findMany({
          where: { slack_id: parent.slack_id },
          include: { meeting: true },
        })
        .then((data) =>
          data.map((meeting_assignment) => meeting_assignment.meeting)
        );
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
