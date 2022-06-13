import { app } from "app";
import { getHomeTab } from "./views/home";
import prisma from "lib/prisma";

export const registerEvents = () => {
  app.event("app_home_opened", async ({ event, client, logger }) => {
    try {
      const home = await getHomeTab(event.user);
      const result = await client.views.publish(home);

      logger.info(result);
    } catch (error) {
      logger.error(error);
    }
  });
  app.event("team_join", async ({ event, client, logger }) => {
    const { user } = event;
    if (!user.is_bot) {
      const row = {
        slack_id: user.id,
        real_name: user.real_name,
        email: user.profile.email,
      };
      await prisma.user.upsert({
        where: { slack_id: user.id },
        update: row,
        create: row,
      });
      console.log(`added user ${user.id}`);
    }
  });

  console.log("⚡️ Events registered!");
};
