import ImageSearch from "@azure/cognitiveservices-imagesearch";
import MSRestAzure from "@azure/ms-rest-azure-js";
import get from "lodash.get";
import {
  STEP_CALLBACK_ID,
  VIEW_CALLBACK_ID,
  BLOCK_SEARCH_TERM,
  ACTION_SEARCH_TERM,
} from "./constants.js";
import { renderStepConfig } from "./view.js";

const AZURE_IMAGE_SEARCH_KEY = process.env.AZURE_IMAGE_SEARCH_KEY;

export const registerImageSearchStep = async function (app) {
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
        searchTerm: get(inputs, "search_term.value", ""),
      };

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

    const searchTerm = get(
      view,
      `state.values.${BLOCK_SEARCH_TERM}.${ACTION_SEARCH_TERM}.value`
    );

    const inputs = {
      search_term: {
        value: searchTerm,
      },
    };

    const errors = {};

    // Ensure we have at least 1 value, if not, attach an error to the first input block
    if (!searchTerm) {
      errors[BLOCK_SEARCH_TERM] = "Please provide a search term";
    }

    if (Object.values(errors).length > 0) {
      return ack({
        response_action: "errors",
        errors,
      });
    }

    // ack the view submission, we're all good there
    ack();

    // Now we need to update the step
    // Construct payload for updating the step
    const params = {
      token: context.botToken,
      workflow_step_edit_id: workflowStepEditId,
      inputs,
      outputs: [
        {
          name: "search_image_url",
          type: "text",
          label: "Search Image URL",
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
    const { search_term: searchTerm } = inputs;

    try {
      //instantiate the image search client
      let credentials = new MSRestAzure.CognitiveServicesCredentials(
        AZURE_IMAGE_SEARCH_KEY
      );
      let client = new ImageSearch.ImageSearchClient(credentials);

      const query = searchTerm.value || "not found";
      const options = {
        count: 150,
        maxFileSize: 40960,
        imageType: "Photo",
        safeSearch: "Strict",
      };

      const imageResults = await client.images.search(query, options);
      const randomResult =
        imageResults.value[
          Math.floor(Math.random() * imageResults.value.length)
        ];
      const searchImageUrl = randomResult.contentUrl;

      // Report back that the step completed
      await app.client.apiCall("workflows.stepCompleted", {
        token: context.botToken,
        workflow_step_execute_id,
        outputs: {
          search_image_url: searchImageUrl,
        },
      });

      app.logger.info("step completed");
    } catch (e) {
      app.logger.error("Error completing step", e.message);
    }
  });
};
