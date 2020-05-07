const get = require("lodash.get");
const { STEP_CALLBACK_ID, VIEW_CALLBACK_ID } = require("./constants");
const { renderStepConfig, parseStateFromView } = require("./view");

exports.registerRandomChannelStep = function (app) {
  // Register step config action
  app.action(
    {
      type: "workflow_step_action",
      callback_id: STEP_CALLBACK_ID,
    },
    async ({ body, ack, context }) => {
      app.logger.info("body: ", JSON.stringify(body, null, 2));
      ack();

      const { workflow_step: { context_id, inputs = {} } = {} } = body;

      // Setup block kit ui state from current config
      const state = {
        context_id,
        channels: get(inputs, "channels.value", []),
      };

      app.logger.info("Opening config view", state);
      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: renderStepConfig(state),
      });
    }
  );

  // Handle saving of step config
  app.view(VIEW_CALLBACK_ID, async ({ ack, view, context }) => {
    // Pull out any values from our view's state that we need that aren't part of the view submission
    const { context_id } = parseStateFromView(view);

    app.logger.info("view submission values", view.state.values);

    const channel1 = get(
      view,
      `state.values.channel_1.channel_1.selected_channel`
    );
    const channel2 = get(
      view,
      `state.values.channel_2.channel_2.selected_channel`
    );
    const channel3 = get(
      view,
      `state.values.channel_3.channel_3.selected_channel`
    );
    const channel4 = get(
      view,
      `state.values.channel_4.channel_4.selected_channel`
    );
    const channel5 = get(
      view,
      `state.values.channel_5.channel_5.selected_channel`
    );

    // Grab an array of channels with values
    const channels = [
      (channel1 || "").trim(),
      (channel2 || "").trim(),
      (channel3 || "").trim(),
      (channel4 || "").trim(),
      (channel5 || "").trim(),
    ].filter(Boolean);

    const inputs = {
      channels: {
        value: channels,
      },
    };

    const errors = {};
    app.logger.info("Channels", channels);

    // Ensure we have at least 1 value, if not, attach an error to the first input block
    if (channels.length === 0) {
      errors.channel_1 = "Please provide at least one channel";
    }

    if (Object.values(errors).length > 0) {
      return ack({
        response_action: "errors",
        errors,
      });
    }

    // construct payload for updating the step
    const params = {
      token: context.botToken,
      workflow_step: {
        context_id,
        inputs,
        outputs: [
          {
            name: "random_channel",
            type: "channel",
            label: "Random Channel",
          },
        ],
      },
    };

    // Call the api to save our step config - we do this prior to the ack of the view_submission
    try {
      app.logger.info("Updating step", params.workflow_step);
      await app.client.apiCall("workflows.updateStep", params);
    } catch (e) {
      app.logger.error("error updating step: ", e.message);

      return ack({
        response_action: "errors",
        errors: {
          ["channel_1"]: e.message,
        },
      });
    }

    ack();
  });

  // Handle running the step
  app.event("workflow_step_started", async ({ event, context }) => {
    const { callback_id, workflow_step = {} } = event;
    if (callback_id !== STEP_CALLBACK_ID) {
      app.logger.info(
        "ignoring callback id for step listener",
        callback_id,
        STEP_CALLBACK_ID
      );
      return;
    }

    app.logger.info("event: ", JSON.stringify(event, null, 2));
    const { inputs = {}, context_id = "" } = workflow_step;
    const { channels = {} } = inputs;
    const channelIds = channels.value;

    // TODO: If we have no users (shouldn't happen) call stepFailed

    // Grab a random string
    const randomChannel =
      channelIds[Math.floor(Math.random() * channelIds.length)];

    // Report back that the step completed
    try {
      await app.client.apiCall("workflows.stepCompleted", {
        token: context.botToken,
        context_id,
        outputs: {
          random_channel: randomChannel || "",
        },
      });

      app.logger.info("step completed", randomChannel || "");
    } catch (e) {
      app.logger.error("Error completing step", e.message, randomString || "");
    }
  });
};
