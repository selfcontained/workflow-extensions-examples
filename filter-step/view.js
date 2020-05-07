const { VIEW_CALLBACK_ID, EQUALS, CONTAINS } = require("./constants");

const renderStepConfig = function (state = {}) {
  return {
    type: "workflow_step",
    // View identifier
    callback_id: VIEW_CALLBACK_ID,
    blocks: renderBlocks(state),
    // Push the state into metadata to have access on view_submission (being kinda lazy and putting more than needed in here)
    private_metadata: serializeStateForView(state),
  };
};

// return blocks for the main form
const renderBlocks = function ({
  value1 = "",
  value2 = "",
  comparator = "equals",
  carryon = true,
}) {
  const equalsOption = {
    text: {
      type: "plain_text",
      text: "Equals",
    },
    value: EQUALS,
  };

  const containsOption = {
    text: {
      type: "plain_text",
      text: "Contains",
    },
    value: CONTAINS,
  };

  const continueOption = {
    text: {
      type: "plain_text",
      text: "Continue the Workflow",
    },
    value: "true",
  };

  const haltOption = {
    text: {
      type: "plain_text",
      text: "Halt the Workflow",
    },
    value: "false",
  };

  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "You can configure this step to match your provided criteria, and either continue or halt the workflow if it matches.",
      },
    },
    {
      type: "input",
      block_id: "value1",
      element: {
        type: "plain_text_input",
        action_id: "value1",
        initial_value: value1 || "",
      },
      label: {
        type: "plain_text",
        text: "First Value",
      },
    },
    {
      type: "input",
      block_id: "comparator",
      element: {
        type: "static_select",
        action_id: "comparator",
        placeholder: {
          type: "plain_text",
          text: "Comparison",
        },
        initial_option: comparator === CONTAINS ? containsOption : equalsOption,
        options: [equalsOption, containsOption],
      },
      label: {
        type: "plain_text",
        text: "Choose how you want to compare your values",
      },
    },
    {
      type: "input",
      block_id: "value2",
      element: {
        type: "plain_text_input",
        action_id: "value2",
        initial_value: value2 || "",
      },
      label: {
        type: "plain_text",
        text: "Second Value",
      },
    },
    {
      type: "divider",
    },
    {
      type: "section",
      block_id: "carryon",
      text: {
        type: "mrkdwn",
        text: "What happens when it matches?",
      },
      accessory: {
        type: "radio_buttons",
        action_id: "carryon",
        initial_option: !carryon ? haltOption : continueOption,
        options: [continueOption, haltOption],
      },
    },
  ];

  return blocks;
};

const serializeStateForView = (state = {}) => {
  return JSON.stringify(state);
};

const parseStateFromView = (view) => {
  let state = {};

  try {
    state = JSON.parse(view.private_metadata);
  } catch (e) {
    console.log(e);
  }

  return state;
};

exports.renderStepConfig = renderStepConfig;
exports.serializeStateForView = serializeStateForView;
exports.parseStateFromView = parseStateFromView;
