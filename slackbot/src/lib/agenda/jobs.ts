import axios from "axios";
import prisma from "lib/prisma";
import { sendMeetingCheckin } from "app/notifications";
import { getNextOccurrence } from "lib/rrule";

export function registerJobs(agenda) {
  agenda.define("sendMeetingCheckin", async (job) => {
    const { meeting_id } = job.attrs.data;
    const meeting = await prisma.meeting.findUnique({
      where: { id: meeting_id },
    });
    const { join_url } = await axios
      .post(
        `https://api.zoom.us/v2/users/me/meetings`,
        {
          agenda: "My Meeting",
          topic: meeting.title,
          tracking_fields: [
            {
              field: "vrms_meeting_id",
              value: meeting.id,
            },
          ],
          type: 1,
        },
        { headers: { Authorization: `Bearer ${process.env.ZOOM_API_JWT}` } }
      )
      .then(({ data }) => data);

    await sendMeetingCheckin(meeting.slack_channel_id, join_url);

    if (meeting.rrule) {
      const nextRunAt = getNextOccurrence(meeting.rrule);
      job.schedule(nextRunAt);
      await job.save();
    }
  });
  console.log("Agenda jobs registered");
}
