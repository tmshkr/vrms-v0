// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import prisma from "lib/prisma";
import { getToken } from "next-auth/jwt";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const token = await getToken({ req });
  if (!token) {
    return res.status(401).send("Unauthorized");
  }

  const app_roles = await prisma.appRoleOnUser.findMany({
    where: {
      slack_id: token.sub,
    },
    select: { role: true },
  });

  res.status(200).json({ app_roles: app_roles.map(({ role }) => role) });
}
