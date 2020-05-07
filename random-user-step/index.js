const get = require("lodash.get");
const { STEP_CALLBACK_ID, VIEW_CALLBACK_ID } = require("./constants");
const { renderStepConfig, parseStateFromView } = require("./view");

exports.registerRandomUserStep = function (app) {
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
        users: get(inputs, "users.value", []),
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

    const user1 = get(view, `state.values.user_1.user_1.selected_user`);
    const user2 = get(view, `state.values.user_2.user_2.selected_user`);
    const user3 = get(view, `state.values.user_3.user_3.selected_user`);
    const user4 = get(view, `state.values.user_4.user_4.selected_user`);
    const user5 = get(view, `state.values.user_5.user_5.selected_user`);

    // Grab an array of users with values
    const users = [
      (user1 || "").trim(),
      (user2 || "").trim(),
      (user3 || "").trim(),
      (user4 || "").trim(),
      (user5 || "").trim(),
    ].filter(Boolean);

    const inputs = {
      users: {
        value: users,
      },
    };

    const errors = {};
    app.logger.info("Users", users);

    // Ensure we have at least 1 value, if not, attach an error to the first input block
    if (users.length === 0) {
      errors.user_1 = "Please provide at least one user";
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
            name: "random_user",
            type: "user",
            label: "Random User",
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
          ["user_1"]: e.message,
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

    const { users = {} } = inputs;
    const userIds = users.value || [];

    // TODO: If we have no users (shouldn't happen) call stepFailed

    // Grab a random string
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];

    // Report back that the step completed
    try {
      await app.client.apiCall("workflows.stepCompleted", {
        token: context.botToken,
        context_id,
        outputs: {
          random_user: randomUser || "",
        },
      });

      app.logger.info("step completed", randomUser || "");
    } catch (e) {
      app.logger.error("Error completing step", e.message, randomString || "");
    }
  });
};
