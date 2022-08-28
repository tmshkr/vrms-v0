import NextAuth from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import prisma from "lib/prisma";
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
        const { provider, provider_account_id } = token;

        session.user.gh_username = token.gh_username;
        session.user.two_factor_authentication =
          token.two_factor_authentication;

        try {
          var vrms_user = JSON.parse(
            cookies.get("vrms_user", { signed: true }) || null
          );
        } catch (err) {
          console.error("Error getting vrms_user cookie: ", err);
        }

        if (!vrms_user) {
          vrms_user = await prisma.account
            .findUnique({
              where: {
                provider_provider_account_id: {
                  provider,
                  provider_account_id,
                },
              },
              select: {
                user: {
                  select: { id: true, slack_id: true, app_roles: true },
                },
              },
            })
            .then(({ user }) => ({
              ...user,
              app_roles: user.app_roles.map(({ role }) => role),
            }));

          cookies.set("vrms_user", JSON.stringify(vrms_user), {
            signed: true,
            maxAge: 1000 * 60,
          });
        }

        session.user.vrms_user = vrms_user;
        return session;
      },
      async jwt(args) {
        const { token, user, account, profile } = args;

        // account, profile, and user are available during sign in
        if (account && profile && user) {
          const { name, email } = user;
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
