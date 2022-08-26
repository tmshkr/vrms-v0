import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";
import { getMongoClient } from "~/lib/mongo";

export default async function handler(req, res) {
  const nextToken = await getToken({ req });
  if (!nextToken) {
    res.status(401).send("Unauthorized");
    return;
  }
  const { provider, providerAccountId } = nextToken;

  const { slack_id } = jwt.verify(req.query.token, process.env.NEXTAUTH_SECRET);
  const accounts = await getMongoClient().then((client) =>
    client.db().collection("accounts")
  );

  const connectedAccount = await accounts.findOne({
    slack_id,
  });

  if (connectedAccount) {
    res
      .status(400)
      .send("This Slack account is already connected to an account");
    return;
  }

  await accounts.updateOne(
    {
      provider,
      providerAccountId,
    },
    { $set: { slack_id } }
  );

  res.status(200).send(`Connected Slack account`);
}
