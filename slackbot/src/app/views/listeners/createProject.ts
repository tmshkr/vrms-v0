import prisma from "lib/prisma";
import { getHomeTab } from "app/views/home";
import { getInnerValues } from "utils/getInnerValues";

export const createProject = async ({ ack, body, view, client, logger }) => {
  await ack();

  const values = getInnerValues(view.state.values);
  const { new_project_title, team_members } = values;
  console.log(values);

  await prisma.project.create({
    data: {
      name: new_project_title.value,
      created_by: body.user.id,
      team_members: {
        create: team_members.selected_conversations.map((slack_id) => {
          if (slack_id === body.user.id) {
            return {
              slack_id,
              role: "OWNER",
            };
          } else {
            return {
              slack_id,
              role: "MEMBER",
            };
          }
        }),
      },
    },
  });

  const home = await getHomeTab(body.user.id);
  await client.views.publish(home);

  for (const slack_id of team_members.selected_conversations) {
    await client.chat.postMessage({
      channel: slack_id,
      text: `<@${body.user.id}> has added you to the ${new_project_title.value} team!`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `<@${body.user.id}> has added you to the *${new_project_title.value}* team!`,
          },
        },
      ],
    });
  }
};
