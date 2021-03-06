import get from "lodash.get";
import {
  STEP_CALLBACK_ID,
  VIEW_CALLBACK_ID,
  CONTAINS,
  EQUALS,
} from "./constants.js";
import {
  renderStepConfig,
  parseStateFromView,
  serializeStateForView,
} from "./view.js";

export const registerFilterStep = function (app) {
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
        value1: get(inputs, "value1.value", ""),
        value2: get(inputs, "value2.value", ""),
        comparator: get(inputs, "comparator.value", ""),
        carryon: get(inputs, "carryon.value", true),
      };

      app.logger.info("Opening config view", state);
      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: renderStepConfig(state),
      });
    }
  );

  // handle the radio button toggle action and store the state in the view's private_metadata
  app.action("carryon", async ({ ack, body, action, context }) => {
    await ack();

    const { view } = body;
    // value is a string-boolean / default to true
    const carryon = get(action, "selected_option.value", "true") !== "false";
    const state = parseStateFromView(view);

    const updatedState = {
      ...state,
      carryon,
    };

    const updatedView = {
      type: view.type,
      callback_id: view.callback_id,
      blocks: view.blocks,
      private_metadata: serializeStateForView(updatedState),
    };

    try {
      await app.client.views.update({
        token: context.botToken,
        view_id: view.id,
        view: updatedView,
      });
    } catch (error) {
      app.logger.error(error);
    }
  });

  // Handle saving of step config
  app.view(VIEW_CALLBACK_ID, async ({ ack, view, body, context }) => {
    // Pull out any values from our view's state that we need that aren't part of the view submission
    const { carryon } = parseStateFromView(view);

    const workflowStepEditId = get(body, `workflow_step.workflow_step_edit_id`);
    const value1 = get(view, `state.values.value1.value1.value`);
    const comparator = get(
      view,
      `state.values.comparator.comparator.selected_option.value`
    );
    const value2 = get(view, `state.values.value2.value2.value`);

    const inputs = {
      value1: {
        value: (value1 || "").trim(),
      },
      comparator: {
        value: comparator,
      },
      value2: {
        value: (value2 || "").trim(),
      },
      carryon: {
        value: !!carryon,
      },
    };

    const errors = {};

    if (!inputs.value1.value) {
      errors.value1 = "Please provide a first value";
    }
    if (!inputs.comparator.value) {
      errors.comparator = "Please select a comparator";
    }
    if (!inputs.value2.value) {
      errors.value1 = "Please provide a first value";
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
      workflow_step_edit_id: workflowStepEditId,
      inputs,
      outputs: [],
    };

    app.logger.info("Updating step", params);

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
    const { value1, comparator, value2, carryon } = inputs;
    const haltOnMatch = !carryon.value;

    console.log("callback_id", callback_id);

    let match = false;

    switch (comparator.value) {
      case CONTAINS:
        match = value1.value.indexOf(value2.value) >= 0;
        break;
      case EQUALS:
      default:
        match = value1.value === value2.value;
    }

    app.logger.info("filter step match: ", match, value1, value2, comparator);

    if (match && !haltOnMatch) {
      // Otherwise report back that the step completed
      try {
        await app.client.apiCall("workflows.stepCompleted", {
          token: context.botToken,
          workflow_step_execute_id,
        });

        app.logger.info("step completed");
      } catch (e) {
        app.logger.error("Error completing step", e.message);
      }
    } else {
      app.logger.info(
        "no match, or halt on match, not completing step",
        match,
        haltOnMatch
      );
    }
  });
};
