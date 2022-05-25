import { sendMeetingCheckin } from "app/notifications";
import { getNextOccurrence } from "lib/rrule";

export function registerJobs(agenda) {
  agenda.define("sendMeetingCheckin", async (job) => {
    const { rrule, slack_channel_id } = job.attrs.data;
    await sendMeetingCheckin(slack_channel_id);
    if (rrule) {
      const nextRunAt = getNextOccurrence(rrule);
      job.schedule(nextRunAt);
      await job.save();
    }
  });
  console.log("Agenda jobs registered");
}
