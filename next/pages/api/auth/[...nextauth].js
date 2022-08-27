import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import prisma from "lib/prisma";
import { getMongoClient } from "~/lib/mongo";

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

export default NextAuth({
  // https://next-auth.js.org/configuration/providers/oauth
  providers: [
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  theme: {
    colorScheme: "light",
  },
  callbacks: {
    async signIn(args) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      return baseUrl;
    },
    async session(args) {
      // console.log("session", args);
      const { session, token, user } = args;
      session.user.gh_username = token.gh_username;
      return session;
    },
    async jwt(args) {
      // console.log("jwt", args);
      const { token, user, account, profile } = args;

      // account and profile are available during sign in
      if (account && profile) {
        const { provider, providerAccountId } = account;
        const { login, two_factor_authentication } = profile;

        token.provider = provider;
        token.providerAccountId = providerAccountId;
        token.gh_username = login;
        token.two_factor_authentication = two_factor_authentication;

        const mongoClient = await getMongoClient();
        await mongoClient
          .db()
          .collection("accounts")
          .updateOne(
            { provider, providerAccountId },
            {
              $set: {
                ...user,
                ...account,
                gh_username: login,
                two_factor_authentication,
              },
            },
            { upsert: true }
          );
      }

      return token;
    },
  },
});
