export const createMeetingModal = (userProjects, slack_id) => ({
  type: "modal",
  // View identifier
  callback_id: "create_meeting_modal",
  title: {
    type: "plain_text",
    text: "Create New Meeting",
  },
  blocks: [
    {
      type: "input",
      label: {
        type: "plain_text",
        text: "What should this meeting be called?",
      },
      element: {
        type: "plain_text_input",
        action_id: "meeting_title",
      },
    },
    {
      type: "input",
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Select a project",
        },
        options: userProjects.map(({ project }) => ({
          text: {
            type: "plain_text",
            text: project?.name,
            emoji: true,
          },
          value: String(project?.id),
        })),
        action_id: "meeting_project",
      },
      label: {
        type: "plain_text",
        text: "Which project is this meeting for?",
      },
    },
    {
      type: "input",
      element: {
        type: "multi_conversations_select",
        placeholder: {
          type: "plain_text",
          text: "Select users",
          emoji: true,
        },
        action_id: "meeting_participants",
        initial_conversations: [slack_id],
        filter: {
          include: ["im"],
          exclude_bot_users: true,
        },
      },
      label: {
        type: "plain_text",
        text: "Who should be in this meeting?",
        emoji: true,
      },
    },
    {
      type: "input",
      element: {
        type: "channels_select",
        placeholder: {
          type: "plain_text",
          text: "Select channel",
        },
        action_id: "meeting_channel",
      },
      label: {
        type: "plain_text",
        text: "Which channel should this meeting be in?",
      },
    },
    // TODO: make it so user can't select a date in the past
    {
      type: "input",
      element: {
        type: "datepicker",
        placeholder: {
          type: "plain_text",
          text: "Select a date",
        },
        action_id: "meeting_datepicker",
      },
      label: {
        type: "plain_text",
        text: "When should the first meeting be?",
      },
    },
    {
      type: "input",
      element: {
        type: "timepicker",
        placeholder: {
          type: "plain_text",
          text: "Select time",
        },
        action_id: "meeting_timepicker",
      },
      label: {
        type: "plain_text",
        text: "At what time?",
      },
    },
    {
      type: "input",
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Select duration",
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "30 minutes",
            },
            value: "30 minutes",
          },
          {
            text: {
              type: "plain_text",
              text: "60 minutes",
            },
            value: "60 minutes",
          },
          {
            text: {
              type: "plain_text",
              text: "90 minutes",
            },
            value: "90 minutes",
          },
        ],
        action_id: "meeting_duration",
      },
      label: {
        type: "plain_text",
        text: "How long should the meeting be?",
      },
    },
    {
      type: "input",
      element: {
        type: "static_select",
        placeholder: {
          type: "plain_text",
          text: "Select frequency",
        },
        options: [
          {
            text: {
              type: "plain_text",
              text: "once every week",
            },
            value: "1 week",
          },
          {
            text: {
              type: "plain_text",
              text: "once every 2 weeks",
            },
            value: "2 weeks",
          },
          {
            text: {
              type: "plain_text",
              text: "no repeat",
            },
            value: "no repeat",
          },
        ],
        action_id: "meeting_frequency",
      },
      label: {
        type: "plain_text",
        text: "This meeting should repeat",
      },
    },
  ],
  submit: {
    type: "plain_text",
    text: "Submit",
  },
});
