const { VIEW_CALLBACK_ID } = require("./constants");

const renderStepConfig = function (state = {}) {
  return {
    type: "workflow_step",
    // View identifier
    callback_id: VIEW_CALLBACK_ID,
    blocks: renderBlocks(state),
    // Push the state into metadata to have access on view_submission (being kinda lazy and putting more than needed in here)
    private_metadata: JSON.stringify(state),
  };
};

// return blocks for the main form
const renderBlocks = function ({ strings = [], user }) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "Add up to 5 values, one of which will be randomly selected when this step runs and output for use in subsequent steps.",
      },
    },
    {
      type: "input",
      block_id: "text_1",
      element: {
        type: "plain_text_input",
        action_id: "text_1",
        initial_value: strings[0] || "",
      },
      label: {
        type: "plain_text",
        text: "One",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "text_2",
      element: {
        type: "plain_text_input",
        action_id: "text_2",
        initial_value: strings[1] || "",
      },
      label: {
        type: "plain_text",
        text: "Two",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "text_3",
      element: {
        type: "plain_text_input",
        action_id: "text_3",
        initial_value: strings[2] || "",
      },
      label: {
        type: "plain_text",
        text: "Three",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "text_4",
      element: {
        type: "plain_text_input",
        action_id: "text_4",
        initial_value: strings[3] || "",
      },
      label: {
        type: "plain_text",
        text: "Four",
      },
    },
    {
      type: "input",
      optional: true,
      block_id: "text_5",
      element: {
        type: "plain_text_input",
        action_id: "text_5",
        initial_value: strings[4] || "",
      },
      label: {
        type: "plain_text",
        text: "Five",
      },
    },
  ];

  return blocks;
};

exports.renderStepConfig = renderStepConfig;

exports.serializeStateForView = (state = {}) => {
  return JSON.stringify(state);
};

exports.parseStateFromView = (view) => {
  let state = {};

  try {
    state = JSON.parse(view.private_metadata);
  } catch (e) {
    console.log(e);
  }

  return state;
};
