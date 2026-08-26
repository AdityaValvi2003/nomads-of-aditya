import { NextResponse } from "next/server";

import { getSession } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/prisma";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const messages =
      await prisma.contactMessage.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(messages);
  } catch (error) {
    console.error(
      "GET /api/admin/contact error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load messages." },
      { status: 500 }
    );
  }
}