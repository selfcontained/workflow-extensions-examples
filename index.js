import { default as Bolt } from "@slack/bolt";
import { registerRandomStringStep } from "./random-string-step/index.js";
import { registerRandomUserStep } from "./random-user-step/index.js";
import { registerRandomChannelStep } from "./random-channel-step/index.js";
import { registerConversationTestStep } from "./conversation-test-step/index.js";
import { registerFilterStep } from "./filter-step/index.js";

// Initializes your app with your bot token and signing secret
const app = new Bolt.App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

registerRandomStringStep(app);
registerRandomUserStep(app);
registerRandomChannelStep(app);
registerFilterStep(app);
registerConversationTestStep(app);

app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error, JSON.stringify(error && error.data));
});

app.receiver.app.get("/", (req, res) => res.send({ ok: true }));

(async () => {
  // Start your app
  const port = process.env.PORT || 3000;
  await app.start(port);

  console.log(`⚡️ Bolt app is running on port ${port}!`);
})();
