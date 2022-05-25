import NextAuth from "next-auth";
import SlackProvider from "next-auth/providers/slack";

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
});
