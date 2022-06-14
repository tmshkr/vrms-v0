# vrms

## Getting Started

Once you've [forked](https://github.com/tmshkr/vrms/fork) and cloned the repository,
install the dependencies with the following command:

```
npm run install:dev
```

### Provision your databases

You'll need a Postgres database, so you can either run one locally
or use a service like [ElephantSQL](https://www.elephantsql.com/).

Provide your connection string starting with `postgres://` as the `DATABASE_URL` in your `.env`.

You'll also need a MongoDB instance for task scheduling with [Agenda](https://github.com/agenda/agenda)
and other document data storage.

[MongoDB Cloud](https://www.mongodb.com/cloud) or a local MongoDB server
can be used to provide your `MONGO_URI` connection string.

### Next.js environment variables

Next.js will look for the `.env` file in its [own folder](./next), so you can use a symlink to
avoid having two separate `.env` files.

On a Mac, you can create a symlink by running the following command from root directory of the repo:

```
ln -s ../.env next/.env
```

### Create a Slack app

Go to [Your Apps](https://api.slack.com/apps) and click **Create New App**.

In the **Create an app** modal that appears, select the option **From an app manifest**.

Select the workspace you want to develop your app in, and then provide the [app manifest](./slackbot/app-manifest.yaml).

> Be sure to replace `YOUR-NAME` with your name so that we can tell who the app belongs to.

Review the summary and click **Create**.

### Slack app setup

On the **Basic Information** page for your app, click **Install to Workspace**.

Under the **App Credentials** heading, you can get the following environment variables:

- `SLACK_CLIENT_ID`
- `SLACK_CLIENT_SECRET`
- `SLACK_SIGNING_SECRET`

Under the **App-Level Tokens** heading, you'll need to create a token to run in [socket mode](https://api.slack.com/apis/connections/socket). Click **Generate Token and Scopes** then give the token any name, and make sure to give it the `connections:write` scope.

Copy and paste the token starting with `xapp` as the `SLACK_APP_TOKEN` in your `.env`.

To get the `SLACK_BOT_TOKEN`, click **OAuth & Permissions** from the sidebar under the **Features** heading.
On that page, you'll find the **Bot User OAuth Token** starting with `xoxb`.
