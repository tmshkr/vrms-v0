import jwt from "jsonwebtoken";
import Cookies from "cookies";
import { getToken } from "next-auth/jwt";
import { getMongoClient } from "~/lib/mongo";
import { notifyAccountConnected } from "lib/slack";

export default async function handler(req, res) {
  const nextToken = await getToken({ req });
  const cookies = new Cookies(req, res);

  if (!nextToken) {
    cookies.set("redirect_to", req.url, {
      httpOnly: false,
      overwrite: true,
      sameSite: "strict",
    });
    res.redirect("/api/auth/signin");
    return;
  }

  const { provider, providerAccountId } = nextToken;

  try {
    var { slack_id } = jwt.verify(req.query.token, process.env.NEXTAUTH_SECRET);
  } catch (err) {
    console.error(err);
    res.redirect("/api/auth/signin");
    return;
  }

  const accounts = await getMongoClient().then((client) =>
    client.db().collection("accounts")
  );

  const connectedAccount = await accounts.findOne({
    slack_id,
  });

  if (connectedAccount) {
    console.log("Slack account already connected", {
      slack_id,
      provider,
      providerAccountId,
    });
    res.redirect("/");
    return;
  }

  const result = await accounts.findOneAndUpdate(
    {
      provider,
      providerAccountId,
    },
    { $set: { slack_id } },
    { returnDocument: "after" }
  );

  console.log(`Connected Slack account`);
  notifyAccountConnected(slack_id, result.value.gh_username);
  res.redirect("/");
}
