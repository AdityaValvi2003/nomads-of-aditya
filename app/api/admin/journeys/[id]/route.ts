import { NextResponse } from "next/server";
import { getSession } from "../../../../../src/lib/auth";
import { prisma } from "../../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(
  _request: Request,
  { params }: RouteContext
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

    const journey =
      await prisma.journey.findUnique({
        where: {
          id,
        },
      });

    if (!journey) {
      return NextResponse.json(
        { error: "Journey not found." },
        { status: 404 }
      );
    }

    await prisma.journey.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE journey error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete journey.",
      },
      { status: 500 }
    );
  }
}