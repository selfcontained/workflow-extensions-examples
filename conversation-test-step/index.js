const get = require("lodash.get");
const { STEP_CALLBACK_ID, VIEW_CALLBACK_ID } = require("./constants");
const { renderStepConfig, parseStateFromView } = require("./view");

exports.registerConversationTestStep = function (app) {
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
        no_filter: get(inputs, "no_filter.value"),
        im_only: get(inputs, "im_only.value"),
        public_private: get(inputs, "public_private.value"),
        public_private_im: get(inputs, "public_private_im.value"),
        public_only: get(inputs, "public_only.value"),
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

    const inputs = {
      no_filter: {
        value: get(
          view,
          "state.values.no_filter.no_filter.selected_conversation"
        ),
      },
      im_only: {
        value: get(view, "state.values.im_only.im_only.selected_conversation"),
      },
      public_private: {
        value: get(
          view,
          "state.values.public_private.public_private.selected_conversation"
        ),
      },
      public_private_im: {
        value: get(
          view,
          "state.values.public_private_im.public_private_im.selected_conversation"
        ),
      },
      public_only: {
        value: get(
          view,
          "state.values.public_only.public_only.selected_conversation"
        ),
      },
    };

    const errors = {};

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
        outputs: [],
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
          ["no_filter"]: e.message,
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
    const { context_id = "" } = workflow_step;

    // Report back that the step completed
    try {
      await app.client.apiCall("workflows.stepCompleted", {
        token: context.botToken,
        context_id,
      });

      app.logger.info("step completed", callback_id);
    } catch (e) {
      app.logger.error("Error completing step", e.message, callback_id);
    }
  });
};
