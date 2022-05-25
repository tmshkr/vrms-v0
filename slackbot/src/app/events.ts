import { app } from "app";
import { getHomeTab } from "./views/home";

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

  console.log("⚡️ Events registered!");
};
