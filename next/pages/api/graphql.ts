import { createServer } from "@graphql-yoga/node";
import prisma from "lib/prisma";

const typeDefs = `
  scalar DateTime

  type Query {
    users: [User]
    projects: [Project]
    meetings: [Meeting]
  }

  type User {
    slack_id: String
    meetings: [Meeting]
    projects: [Project]
  }
  
  type Project {
    id: Int
    created_by: String
    is_active: Boolean
    meetings: [Meeting]
    name: String
    users: [User]
  }

  type Meeting {
    id: Int
    created_by: String
    duration: Int
    is_active: Boolean
    project: Project!
    project_id: Int
    rrule: String
    slack_channel_id: String
    start_date: DateTime
    title: String
    users: [User]
  }
`;

const resolvers = {
  Query: {
    users(parent, args, context) {
      return prisma.user.findMany();
    },
    projects(parent, args, context) {
      return prisma.project.findMany();
    },
    meetings(parent, args, context) {
      return prisma.meeting.findMany();
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
    projects(parent, args, context) {
      return prisma.teamMember
        .findMany({
          where: { slack_id: parent.slack_id },
          include: { project: true },
        })
        .then((data) =>
          data.map((project_assignment) => project_assignment.project)
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
