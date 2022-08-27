import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import prisma from "lib/prisma";
import { getMongoClient } from "~/lib/mongo";
const Cookies = require("cookies");

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options

const nextAuthOptions = (req, res) => {
  const cookies = new Cookies(req, res, {
    keys: process.env.COOKIE_KEYS.split(" "),
  });

  return {
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
        const { session, token } = args;
        session.user.gh_username = token.gh_username;
        session.user.two_factor_authentication =
          token.two_factor_authentication;

        // store the roles in a cookie to prevent excessive db queries
        let app_roles = cookies.get("app_roles", { signed: true });
        if (!app_roles) {
          app_roles = await prisma.user
            .findUnique({
              where: {
                gh_account_id: Number(token.providerAccountId),
              },
              select: {
                app_roles: {
                  select: { role: true },
                },
              },
            })
            .then(({ app_roles }) =>
              app_roles.map(({ role }) => role).join(",")
            );

          cookies.set("app_roles", app_roles, {
            signed: true,
            maxAge: 1000 * 60,
          });
        }

        session.user.roles = app_roles;
        return session;
      },
      async jwt(args) {
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
  };
};

export default (req, res) => {
  return NextAuth(req, res, nextAuthOptions(req, res));
};
