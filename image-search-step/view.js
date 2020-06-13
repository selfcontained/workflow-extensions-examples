import {
  VIEW_CALLBACK_ID,
  BLOCK_SEARCH_TERM,
  ACTION_SEARCH_TERM,
} from "./constants.js";

export const renderStepConfig = function (state = {}) {
  return {
    type: "workflow_step",
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
        text:
          "Provide a search term, and this step will return a matching image.",
      },
    },
    {
      type: "input",
      block_id: BLOCK_SEARCH_TERM,
      element: {
        type: "plain_text_input",
        action_id: ACTION_SEARCH_TERM,
        initial_value: searchTerm || "",
      },
      label: {
        type: "plain_text",
        text: "One",
      },
    },
  ];

  return blocks;
};
