const get = require("lodash.get");
const { STEP_CALLBACK_ID, VIEW_CALLBACK_ID } = require("./constants");
const { renderStepConfig } = require("./view");

exports.registerRandomUserStep = function (app) {
  // Register step config action
  app.action(
    {
      type: "workflow_step_edit",
      callback_id: STEP_CALLBACK_ID,
    },
    async ({ body, ack, context }) => {
      ack();

      const { workflow_step: { inputs = {} } = {} } = body;

      // Setup block kit ui state from current config
      const state = {
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
    const workflowStepEditId = get(view, `workflow_step_edit_id`);

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

    // ack the view submission, we're all good there
    ack();

    // construct payload for updating the step
    const params = {
      token: context.botToken,
      workflow_step: {
        workflow_step_edit_id: workflowStepEditId,
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

    app.logger.info("updateStep params: ", params);

    // Call the api to save our step config - we do this prior to the ack of the view_submission
    try {
      await app.client.apiCall("workflows.updateStep", params);
    } catch (e) {
      app.logger.error("error updating step: ", e.message);
    }
  });

  // Handle running the step
  app.event("workflow_step_execute", async ({ event, context }) => {
    const { callback_id, workflow_step = {} } = event;
    if (callback_id !== STEP_CALLBACK_ID) {
      return;
    }

    const { inputs = {}, workflow_step_execute_id } = workflow_step;
    const { users = {} } = inputs;
    const userIds = users.value || [];

    // Grab a random user
    const randomUser = userIds[Math.floor(Math.random() * userIds.length)];

    // Report back that the step completed
    try {
      await app.client.apiCall("workflows.stepCompleted", {
        token: context.botToken,
        workflow_step_execute_id,
        outputs: {
          random_user: randomUser || "",
        },
      });

      app.logger.info("step completed", randomUser || "");
    } catch (e) {
      app.logger.error("Error completing step", e.message, randomUser || "");
    }
  });
};
