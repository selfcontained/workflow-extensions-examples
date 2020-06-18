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
        text: "Nothing to see here, just save",
      },
    },
  ];

  return blocks;
};
