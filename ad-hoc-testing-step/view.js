import {
  VIEW_CALLBACK_ID,
  BLOCK_SEARCH_TERM,
  ACTION_SEARCH_TERM,
} from "./constants.js";

export const renderStepConfig = function (state = {}) {
  return {
    type: "modal",
    title: {
      type: "plain_text",
      text: "A Modal in WB?",
    },
    submit: {
      type: "plain_text",
      text: "Save It",
    },
    // type: "workflow_step",
    // View identifier
    callback_id: VIEW_CALLBACK_ID,
    blocks: renderBlocks(state),
  };
};

// return blocks for the main form
const renderBlocks = function ({ searchTerm = "" }) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: "Nothing to see here, just save",
      },
    },
    {
      type: "input",
      optional: false,
      block_id: "text_tester",
      element: {
        type: "plain_text_input",
        action_id: "text_tester",
      },
      label: {
        type: "plain_text",
        text: "Five",
      },
      hint: {
        type: "plain_text",
        text: "This is some hint text",
      },
    },
  ];

  return blocks;
};
