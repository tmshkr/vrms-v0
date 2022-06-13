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
    email: String
    slack_id: String
    meetings: [Meeting]
    projects: [Project]
    real_name: String
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
      return prisma.meetingParticipant
        .findMany({
          where: { slack_id: parent.slack_id },
          include: { meeting: true },
        })
        .then((data) => data.map(({ meeting }) => meeting));
    },
    projects(parent, args, context) {
      return prisma.teamMember
        .findMany({
          where: { slack_id: parent.slack_id },
          include: { project: true },
        })
        .then((data) => data.map(({ project }) => project));
    },
  },
  Project: {
    meetings(parent, args, context) {
      return prisma.meeting.findMany({
        where: { project_id: parent.id },
      });
    },
    users(parent, args, context) {
      return prisma.teamMember
        .findMany({
          where: { project_id: parent.id },
          include: { user: true },
        })
        .then((data) => {
          return data.map(({ user }) => user);
        });
    },
  },
  Meeting: {
    users(parent, args, context) {
      return prisma.meetingParticipant
        .findMany({ where: { meeting_id: parent.id }, include: { user: true } })
        .then((data) => {
          return data.map(({ user }) => user);
        });
    },
    project(parent, args, context) {
      return prisma.project.findUnique({ where: { id: parent.project_id } });
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
