# VRMS Slackbot

## Overview

A Slack app to help volunteers create, manage, and view projects and meetings.

## Tech Stack

- [Heroku](https://www.heroku.com/)
- [MongoDB](https://github.com/mongodb/node-mongodb-native)
- [PostgreSQL](https://www.postgresql.org/)
- [Prisma](https://www.prisma.io/)
- [Slack Bolt](https://slack.dev/bolt-js/tutorial/getting-started)
- [TypeScript](https://www.typescriptlang.org/)

## Getting Started

Once you've forked and cloned the repository, you can run the following commands to install the dependencies, generate the Prisma client, and run the app locally:

```
npm install
npx prisma generate
npm run dev
```

If you're using your own Postgres database, you'll need to push the schema to your db:

```
npx prisma db push
```

You may also want to work with the database via [Prisma Studio](https://www.prisma.io/studio):

```
npx prisma studio
```
