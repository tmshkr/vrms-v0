import prisma from "lib/prisma";
import dayjs from "lib/dayjs";
import { getNextOccurrence } from "lib/rrule";
import axios from "axios";
const jwt = require("jsonwebtoken");

const renderProject = (project) => {
  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `:small_blue_diamond: ${project.name}`,
    },
  };
};

const renderMeeting = (meeting) => {
  const nextMeeting = meeting.rrule
    ? getNextOccurrence(meeting.rrule)
    : meeting.start_date;

  const url = new URL("https://www.google.com/calendar/event");
  url.searchParams.set(
    "eid",
    Buffer.from(
      `${meeting.gcal_event_id}_${dayjs(nextMeeting)
        .utc()
        .format("YYYYMMDDTHHmmss[Z]")} ${process.env.GOOGLE_CALENDAR_ID}`
    )
      .toString("base64")
      .replace(/=/g, "")
  );

  return {
    type: "section",
    text: {
      type: "mrkdwn",
      text: `:small_blue_diamond: *${meeting.title}* – ${dayjs
        .tz(nextMeeting)
        .format("dddd, MMMM D, h:mm a")} – <${url}|Add to Calendar>`,
    },
  };
};

export const getHomeTab = async (slack_id) => {
  const [quote] = await axios
    .get("https://zenquotes.io/api/today")
    .then((res) => res.data)
    .catch(console.error);

  const { team_assignments, meeting_assignments, gh_account_id } =
    await prisma.user.findUnique({
      where: { slack_id },
      include: {
        team_assignments: {
          orderBy: { id: "asc" },
          include: { project: true },
        },
        meeting_assignments: {
          include: {
            meeting: true,
          },
        },
      },
    });

  return {
    user_id: slack_id,
    view: {
      type: "home",
      blocks: [
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":house: Welcome to VRMS",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Here you'll find an overview of your projects and upcoming meetings.`,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: gh_account_id ? "Open Dashboard" : "Connect Account",
              emoji: true,
            },
            url: gh_account_id
              ? process.env.NEXTAUTH_URL
              : `${process.env.NEXTAUTH_URL}/api/connect/slack?token=${jwt.sign(
                  { slack_id },
                  process.env.NEXTAUTH_SECRET
                )}`,
            action_id: "open_dashboard",
            style: "primary",
          },
        },
        {
          type: "divider",
        },
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":open_file_folder: My Projects",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "Projects you're working on",
            emoji: true,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Create New Project",
              emoji: true,
            },
            action_id: "create_new_project",
          },
        },
        ...team_assignments?.map(({ project }) => renderProject(project)),
        {
          type: "divider",
        },
        {
          type: "header",
          text: {
            type: "plain_text",
            text: ":calendar: Upcoming Meetings",
            emoji: true,
          },
        },
        {
          type: "section",
          text: {
            type: "plain_text",
            text: "Meetings for projects",
            emoji: true,
          },
          accessory: {
            type: "button",
            text: {
              type: "plain_text",
              text: "Create New Meeting",
              emoji: true,
            },
            action_id: "create_new_meeting",
          },
        },
        ...meeting_assignments?.map(({ meeting }) => renderMeeting(meeting)),
        {
          type: "divider",
        },
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `_${quote.q}_\n${quote.a}`,
          },
        },
      ],
    },
  };
};
