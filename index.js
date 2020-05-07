const https = require("https");
const { App } = require("@slack/bolt");
const { registerRandomStringStep } = require("./random-string-step");
const { registerRandomUserStep } = require("./random-user-step");
const { registerRandomChannelStep } = require("./random-channel-step");
const { registerConversationTestStep } = require("./conversation-test-step");
const { registerFilterStep } = require("./filter-step");

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
});

registerRandomStringStep(app);
registerRandomUserStep(app);
registerRandomChannelStep(app);
registerConversationTestStep(app);
registerFilterStep(app);

app.error((error) => {
  // Check the details of the error to handle cases where you should retry sending a message or stop the app
  console.error(error, JSON.stringify(error && error.data));
});

(async () => {
  // Start your app
  const port = process.env.PORT || 3000;
  await app.start(port);

  console.log(`⚡️ Bolt app is running on port ${port}!`);
})();
