import NextAuth from "next-auth";
import SlackProvider from "next-auth/providers/slack";
import prisma from "lib/prisma";
import { getMongoClient } from "~/lib/mongo";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export default NextAuth({
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    SlackProvider({
      clientId: process.env.SLACK_CLIENT_ID || "",
      clientSecret: process.env.SLACK_CLIENT_SECRET || "",
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session) {
        const slack_id = token.sub;
        const app_roles = await prisma.appRoleOnUser.findMany({
          where: {
            slack_id,
          },
          select: { role: true },
        });
        session.user.app_roles = app_roles.map(({ role }) => role);
        session.user.slack_id = slack_id;

        const mongoClient = await getMongoClient();
        const doc = await mongoClient
          .db()
          .collection("onboarding")
          .findOne({ _id: slack_id });

        if (!doc || !doc.onboarding_complete) {
          mongoClient
            .db()
            .collection("onboarding")
            .updateOne(
              { _id: slack_id },
              { $set: { onboarding_complete: false } },
              { upsert: true }
            );
        }

        session.user.onboarding_complete = doc?.onboarding_complete || false;
      }

      return session;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      return token;
    },
  },
});
