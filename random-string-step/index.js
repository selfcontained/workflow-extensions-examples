const get = require("lodash.get");
const { STEP_CALLBACK_ID, VIEW_CALLBACK_ID } = require("./constants");
const { renderStepConfig, parseStateFromView } = require("./view");

exports.registerRandomStringStep = function (app) {
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
        strings: get(inputs, "strings.value", []),
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

    const text1 = get(view, `state.values.text_1.text_1.value`);
    const text2 = get(view, `state.values.text_2.text_2.value`);
    const text3 = get(view, `state.values.text_3.text_3.value`);
    const text4 = get(view, `state.values.text_4.text_4.value`);
    const text5 = get(view, `state.values.text_5.text_5.value`);

    // Grab an array of strings with values
    const strings = [
      (text1 || "").trim(),
      (text2 || "").trim(),
      (text3 || "").trim(),
      (text4 || "").trim(),
      (text5 || "").trim(),
    ].filter(Boolean);

    const inputs = {
      strings: {
        value: strings,
      },
    };

    const errors = {};
    app.logger.info("Strings", strings);
    // Ensure we have at least 1 value, if not, attach an error to the first input block
    if (strings.length === 0) {
      errors.text_1 = "Please provide at least one string";
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
            name: "random_string",
            type: "text",
            label: "Random String",
          },
        ],
      },
    };

    // Call the api to save our step config - we do this prior to the ack of the view_submission
    try {
      app.logger.info(
        "Updating step",
        JSON.stringify(params.workflow_step, null, 2)
      );
      await app.client.apiCall("workflows.updateStep", params);
    } catch (e) {
      app.logger.error("error updating step: ", e.message);

      return ack({
        response_action: "errors",
        errors: {
          ["text_1"]: e.message,
        },
      });
    }

    ack();
  });

  // Handle running the step
  app.event("workflow_step_started", async ({ event, context }) => {
    app.logger.info("event: ", JSON.stringify(event, null, 2));

    const { callback_id, workflow_step = {} } = event;
    if (callback_id !== STEP_CALLBACK_ID) {
      app.logger.info(
        "ignoring callback id for step listener",
        callback_id,
        STEP_CALLBACK_ID
      );
      return;
    }

    const { inputs = {}, context_id = "" } = workflow_step;
    const { strings = {} } = inputs;
    const values = strings.value || [];

    console.log("callback_id", callback_id);
    // TODO: If we have no strings call stepFailed

    // Grab a random string
    var randomString = values[Math.floor(Math.random() * values.length)];

    // Report back that the step completed
    try {
      await app.client.apiCall("workflows.stepCompleted", {
        token: context.botToken,
        context_id,
        outputs: {
          random_string: randomString || "",
        },
      });

      app.logger.info("step completed", randomString || "");
    } catch (e) {
      app.logger.error("Error completing step", e.message, randomString || "");
    }
  });
};
