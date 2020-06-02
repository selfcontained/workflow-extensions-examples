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
const renderBlocks = function ({
  no_filter,
  im_only,
  public_private,
  public_private_im,
  public_only,
}) {
  const blocks = [
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text:
          "This step is strictly to test conversation selects.  Different combinations of filter properties should produce different types of workflow variables as options",
      },
    },
    {
      type: "input",
      block_id: "no_filter",
      element: {
        type: "conversations_select",
        action_id: "no_filter",
        initial_conversation: no_filter || undefined,
      },
      label: {
        type: "plain_text",
        text: "No Filter",
      },
      hint: {
        type: "plain_text",
        text: "Should have workflow users and channels",
      },
    },
    {
      type: "input",
      block_id: "im_only",
      optional: true,
      element: {
        type: "conversations_select",
        action_id: "im_only",
        initial_conversation: im_only || undefined,
        filter: {
          include: ["im"],
        },
      },
      label: {
        type: "plain_text",
        text: "Include IM only",
      },
      hint: {
        type: "plain_text",
        text: "Should have workflow users",
      },
    },
    {
      type: "input",
      block_id: "public_private",
      optional: true,
      element: {
        type: "conversations_select",
        action_id: "public_private",
        initial_conversation: public_private || undefined,
        filter: {
          include: ["public", "private"],
        },
      },
      label: {
        type: "plain_text",
        text: "Include Public/Private",
      },
      hint: {
        type: "plain_text",
        text: "Should have workflow channels",
      },
    },
    {
      type: "input",
      block_id: "public_private_im",
      optional: true,
      element: {
        type: "conversations_select",
        action_id: "public_private_im",
        initial_conversation: public_private_im || undefined,
        filter: {
          include: ["public", "private", "im"],
        },
      },
      label: {
        type: "plain_text",
        text: "Include Public/Private & IM",
      },
      hint: {
        type: "plain_text",
        text: "Should have workflow users and channels",
      },
    },
    {
      type: "input",
      block_id: "public_only",
      optional: true,
      element: {
        type: "conversations_select",
        action_id: "public_only",
        initial_conversation: public_only || undefined,
        filter: {
          include: ["public"],
        },
      },
      label: {
        type: "plain_text",
        text: "Include Public",
      },
      hint: {
        type: "plain_text",
        text: "Should have no workflow users or channels",
      },
    },
  ];

  return blocks;
};
