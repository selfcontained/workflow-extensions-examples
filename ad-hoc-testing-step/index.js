import get from "lodash.get";
import { STEP_CALLBACK_ID, VIEW_CALLBACK_ID } from "./constants.js";
import { renderStepConfig } from "./view.js";

export const registerStep = async function (app) {
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
      const state = {};

      app.logger.info("Opening config view");
      await app.client.views.open({
        token: context.botToken,
        trigger_id: body.trigger_id,
        view: renderStepConfig(state),
      });
    }
  );

  // Handle saving of step config
  app.view(VIEW_CALLBACK_ID, async ({ ack, view, body, context }) => {
    const workflowStepEditId = get(body, `workflow_step.workflow_step_edit_id`);

    // ack the view submission, we're all good there
    ack();

    // Now we need to update the step
    // Construct payload for updating the step
    const params = {
      token: context.botToken,
      workflow_step_edit_id: workflowStepEditId,
      inputs: {},
      outputs: [
        {
          type: "text",
          name: "camelCasedProp",
          label: "camelCasedProp",
        },
        {
          type: "text",
          name: "snake_cased_prop",
          label: "snake_cased_prop",
        },
        {
          type: "text",
          name: "Capitalized",
          label: "Capitalized",
        },
      ],
    };

    // Call the api to save our step config - we do this prior to the ack of the view_submission
    try {
      await app.client.apiCall("workflows.updateStep", params);
    } catch (e) {
      app.logger.error("error updating step: ", e.message);
    }
  });

  // Handle running the step
  app.event("workflow_step_execute", async ({ event, body, context }) => {
    const { callback_id, workflow_step = {} } = event;
    if (callback_id !== STEP_CALLBACK_ID) {
      return;
    }

    const { inputs = {}, workflow_step_execute_id } = workflow_step;

    try {
      // Report back that the step completed
      await app.client.apiCall("workflows.stepCompleted", {
        token: context.botToken,
        workflow_step_execute_id,
        outputs: {},
      });

      app.logger.info("step completed");
    } catch (e) {
      app.logger.error("Error completing step", e.message);
    }
  });
};
