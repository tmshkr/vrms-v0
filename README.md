# vrms

## Getting Started

Once you've [forked](https://github.com/tmshkr/vrms/fork) and cloned the repository,
install the dependencies with the following command:

```
npm run install:dev
```

### Provision a database

You'll need a Postgres database, so you can either run one locally
or use a service like [ElephantSQL](https://www.elephantsql.com/).

Provide your connection string starting with `postgres://` as the `DATABASE_URL`
environment variable in your `.env`.

### Create a Slack app

Go to [Your Apps](https://api.slack.com/apps) and click **Create New App**.

In the **Create an app** modal that appears, select the option **From an app manifest**.

Select the workspace you want to develop your app in, and then provide the [app manifest](./slackbot/app-manifest.yaml).

Be sure to replace `YOUR-NAME` with your name so that we can tell who the app belongs to.

Review the summary and click **Create**.
