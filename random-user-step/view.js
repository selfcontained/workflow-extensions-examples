import { VIEW_CALLBACK_ID } from "./constants.js";

export const renderStepConfig = function (state = {}) {
  return {
    type: "workflow_step",
    // View identifier
    callback_id: VIEW_CALLBACK_ID,
    blocks: renderBlocks(state),
  };
};

// return blocks for the main form
const renderBlocks = function ({ users = [] }) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "Add up to 5 users, one of which will be randomly selected when this step runs and output for use in subsequent steps.",
      },
    },
    {
      type: "input",
      block_id: "user_1",
      element: {
        type: "users_select",
        action_id: "user_1",
        initial_user: users[0] || undefined,
      },
      label: {
        type: "plain_text",
        text: "One",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "user_2",
      element: {
        type: "users_select",
        action_id: "user_2",
        initial_user: users[1] || undefined,
      },
      label: {
        type: "plain_text",
        text: "Two",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "user_3",
      element: {
        type: "users_select",
        action_id: "user_3",
        initial_user: users[2] || undefined,
      },
      label: {
        type: "plain_text",
        text: "Three",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "user_4",
      element: {
        type: "users_select",
        action_id: "user_4",
        initial_user: users[3] || undefined,
      },
      label: {
        type: "plain_text",
        text: "Four",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "user_5",
      element: {
        type: "users_select",
        action_id: "user_5",
        initial_user: users[4] || undefined,
      },
      label: {
        type: "plain_text",
        text: "Five",
      },
    },
  ];

  return blocks;
};
