## Setup

This runs a slack app that contains a few examples of workflow steps. It's meant as a reference to show how to build different types of workflow steps, and the difference pieces involved in it.  To get going, you'll need to create a new Slack App connected to the workspace we're testing on.

1. Create an app on https://api.slack.com
2. Go to Workflow Steps under Features in the left sidebar to get started with step configuration
3. Necessary scopes are added automatically when you enable workflow steps
4. You must enable Interactivity and Events, and add the required request URL for both (https://your-domain.ngrok.io/slack/events if you're using ngrok). Make sure to also subscribe to the `workflow_step_execute` bot event.
5. Install (or reinstall) your app in the workspace.
6. Optional - This app includes a `Update your Slack Status step` that requires some OAuth configuration. If you want to enable this step, make sure to do the following
 * Add the `users:read` bot scope
 * Add the `users.profile:write` user scope
 * Add a redirect url that is your apps publicly addressible domain, i.e. https://your-domian.ngrok.io if you're using ngrok.

### Dependencies

* Pull this repo, and run `npm install`
* You'll need a redis instance running, which can be local or hosted, but a `REDIS_URL` environment variable will be needed.  You can disable / remove redis support if you don't want the `Update your Slack Status` step to work.
* This uses a branch of `@slack/bolt` for now until we PR the changes into it

### Environment Variables

```
// sources a .env file
npm start 
```

You'll need to create a `.env` file with the following values to get things working correctly.  Some of them you'll need grab from your Slack app you created earlier.

```
export HOST='https://berad.ngrok.io'
export REDIS_URL='redis://your-redis-connection-params'
export PORT='3000'
export SLACK_CLIENT_ID='<client-id>'
export SLACK_CLIENT_SECRET='<client-secret>'
export SLACK_SIGNING_SECRET='<signing-secret>'
export SLACK_VERIFICATION_TOKEN='<verification-token>'
export SLACK_BOT_TOKEN='<xoxb-bot-token>'
```


### Fire it up

* Feel free to remove/replace/update any of the examples steps in here.  Most likely you'll want to setup a new one using your step's `callback_id` value that you added to your app.
* Start your slack app w/ `npm run dev`
