if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}
const { App } = require("@slack/bolt");
import { PrismaClient } from "@prisma/client";
const prisma: PrismaClient = new PrismaClient();

// Initialize app
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
  socketMode: true,
  appToken: process.env.SLACK_APP_TOKEN,
});

(async () => {
  console.log("fetching users");
  const result = await app.client.users.list();
  const users = result.members.filter(
    (x) => x.is_bot === false && x.name !== "slackbot"
  );

  for (const user of users) {
    await prisma.user.upsert({
      where: { slack_id: user.id },
      update: {},
      create: { slack_id: user.id },
    });
    console.log(`added user ${user.id}`);
  }
})();
