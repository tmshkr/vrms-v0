import jwt from "jsonwebtoken";
import Cookies from "cookies";
import { getToken } from "next-auth/jwt";
import prisma from "lib/prisma";
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

  const { provider, providerAccountId, gh_username } = nextToken;

  if (provider !== "github") {
    res.status(501).send("Provider not implemented");
    return;
  }

  try {
    var { slack_id } = jwt.verify(req.query.token, process.env.NEXTAUTH_SECRET);
  } catch (err) {
    console.error(err);
    res.redirect("/api/auth/signin");
    return;
  }

  try {
    var { count } = await prisma.user.updateMany({
      where: { AND: [{ slack_id }, { gh_account_id: null }] },
      data: {
        gh_account_id: Number(providerAccountId),
      },
    });
  } catch (err) {
    console.error(err);
  }

  if (count === 1) {
    console.log(`Connected Slack account`, slack_id);
    notifyAccountConnected(slack_id, gh_username);
    res.redirect("/");
  } else if (count === 0) {
    res.send("It looks like your account is already connected");
  } else {
    console.error("There was a problem updating the Slack connection", {
      provider,
      providerAccountId,
      gh_username,
      slack_id,
    });
    res.status(500).send("Server error");
  }
}
