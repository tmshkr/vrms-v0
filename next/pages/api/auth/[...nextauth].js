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
        console.log("session", args);
        const { session, token } = args;
        // session.user.gh_username = token.gh_username;
        // session.user.two_factor_authentication =
        //   token.two_factor_authentication;

        // store the roles in a cookie to prevent excessive db queries
        // let app_roles = cookies.get("app_roles", { signed: true });
        // if (!app_roles) {
        //   app_roles = await prisma.user
        //     .findUnique({
        //       where: {
        //         gh_account_id: Number(token.providerAccountId),
        //       },
        //       select: {
        //         app_roles: {
        //           select: { role: true },
        //         },
        //       },
        //     })
        //     .then(({ app_roles }) =>
        //       app_roles.map(({ role }) => role).join(",")
        //     );

        //   cookies.set("app_roles", app_roles, {
        //     signed: true,
        //     maxAge: 1000 * 60,
        //   });
        // }

        // session.user.app_roles = app_roles;
        return session;
      },
      async jwt(args) {
        console.log("jwt", args);
        const { token, user, account, profile } = args;

        // account and profile are available during sign in
        if (account && profile) {
          const { name, email, image } = user;
          const {
            provider,
            type,
            providerAccountId: provider_account_id,
            access_token,
            token_type,
            scope,
          } = account;
          const { login: gh_username, two_factor_authentication } = profile;

          token.provider = provider;
          token.provider_account_id = provider_account_id;
          token.gh_username = gh_username;
          token.scope = scope;
          token.type = type;
          token.access_token = access_token;
          token.token_type = token_type;
          token.two_factor_authentication = two_factor_authentication;

          await prisma.account
            .update({
              where: {
                provider_provider_account_id: { provider, provider_account_id },
              },
              data: {
                provider,
                provider_account_id,
                access_token,
                email,
                gh_username,
                name,
                scope,
                token_type,
                type,
                two_factor_authentication,
              },
            })
            .catch((err) => {
              const { meta } = err;
              if (meta.cause == "Record to update not found.") {
                console.log("User logged in without an existing VRMS account");
              } else {
                console.error(err);
              }
            });
        }

        return token;
      },
    },
  };
};

export default (req, res) => {
  return NextAuth(req, res, nextAuthOptions(req, res));
};
