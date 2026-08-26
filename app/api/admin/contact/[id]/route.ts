import { NextResponse } from "next/server";

import { getSession } from "../../../../../src/lib/auth";
import { prisma } from "../../../../../src/lib/prisma";

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    if (
      body.status !== "UNREAD" &&
      body.status !== "READ"
    ) {
      return NextResponse.json(
        { error: "Invalid message status." },
        { status: 400 }
      );
    }

    const message =
      await prisma.contactMessage.update({
        where: {
          id,
        },

        data: {
          status: body.status,
        },
      });

    return NextResponse.json(message);
  } catch (error) {
    console.error(
      "PATCH /api/admin/contact/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update message." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  {
    params,
  }: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    await prisma.contactMessage.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/contact/[id] error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to delete message." },
      { status: 500 }
    );
  }
}