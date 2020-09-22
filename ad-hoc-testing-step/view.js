import {
  VIEW_CALLBACK_ID,
  BLOCK_SEARCH_TERM,
  ACTION_SEARCH_TERM,
} from "./constants.js";

export const renderStepConfig = function (state = {}) {
  return {
    type: "workflow_step",
    callback_id: VIEW_CALLBACK_ID,
    blocks: renderBlocks(state),
    // testing out disabling the submit button
    submit_disabled: false,
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
      block_id: "test_text_block",
      element: {
        type: "plain_text_input",
        action_id: "test_text_block",
      },
      label: {
        type: "plain_text",
        text: "One",
      },
    },
    {
      type: "image",
      title: {
        type: "plain_text",
        text: "I Need a Marg",
        emoji: true,
      },
      image_url:
        "https://assets3.thrillist.com/v1/image/1682388/size/tl-horizontal_main.jpg",
      alt_text: "marg",
    },
  ];

  return blocks;
};
