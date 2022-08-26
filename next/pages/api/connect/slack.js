import jwt from "jsonwebtoken";
import { getToken } from "next-auth/jwt";
import { getMongoClient } from "~/lib/mongo";

export default async function handler(req, res) {
  const { provider, providerAccountId } = await getToken({ req });
  if (!provider) {
    res.status(401).send("Unauthorized");
    return;
  }

  const { slack_id } = jwt.verify(req.query.token, process.env.NEXTAUTH_SECRET);
  const mongoClient = await getMongoClient();
  await mongoClient.db().collection("accounts").updateOne(
    {
      provider,
      providerAccountId,
    },
    { $set: { slack_id } },
    { upsert: true }
  );

  res.status(200).send(`Connected Slack account`);
}
