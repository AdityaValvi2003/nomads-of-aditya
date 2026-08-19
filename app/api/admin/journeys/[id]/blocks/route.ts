import { NextResponse } from "next/server";
import { getSession } from "../../../../../../src/lib/auth";
import { prisma } from "../../../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Get all content blocks for a journey.
*/
export async function GET(
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

    const blocks = await prisma.contentBlock.findMany({
      where: {
        journeyId: id,
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error("GET journey blocks error:", error);

    return NextResponse.json(
      { error: "Failed to load content blocks." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Create a new content block.
*/
export async function POST(
  request: Request,
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

    const body = await request.json();

    const type = body.type;
    const data = body.data ?? {};
    const imageDisplay = body.imageDisplay ?? null;

    if (!type) {
      return NextResponse.json(
        { error: "Block type is required." },
        { status: 400 }
      );
    }

    const journey = await prisma.journey.findUnique({
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

    const lastBlock = await prisma.contentBlock.findFirst({
      where: {
        journeyId: id,
      },
      orderBy: {
        position: "desc",
      },
    });

    const position = lastBlock
      ? lastBlock.position + 1
      : 0;

    const block = await prisma.contentBlock.create({
      data: {
        type,
        position,
        data,
        imageDisplay,

        journey: {
          connect: {
            id,
          },
        },
      },
    });

    return NextResponse.json(block, {
      status: 201,
    });
  } catch (error) {
    console.error("POST journey block error:", error);

    return NextResponse.json(
      { error: "Failed to create content block." },
      { status: 500 }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
| Delete a content block.
*/
export async function DELETE(
  request: Request,
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

    const body = await request.json();

    const blockId = body.blockId;

    if (!blockId) {
      return NextResponse.json(
        { error: "Block ID is required." },
        { status: 400 }
      );
    }

    const block = await prisma.contentBlock.findFirst({
      where: {
        id: blockId,
        journeyId: id,
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: "Content block not found." },
        { status: 404 }
      );
    }

    await prisma.contentBlock.delete({
      where: {
        id: blockId,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE journey block error:", error);

    return NextResponse.json(
      { error: "Failed to delete content block." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
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

    const body = await request.json();

    const blockId = body.blockId;
    const data = body.data;

    if (!blockId) {
      return NextResponse.json(
        { error: "Block ID is required." },
        { status: 400 }
      );
    }

    const block = await prisma.contentBlock.findFirst({
      where: {
        id: blockId,
        journeyId: id,
      },
    });

    if (!block) {
      return NextResponse.json(
        { error: "Content block not found." },
        { status: 404 }
      );
    }

    const updatedBlock =
      await prisma.contentBlock.update({
        where: {
          id: blockId,
        },
        data: {
          data,
        },
      });

    return NextResponse.json({
      success: true,
      data: updatedBlock.data,
    });
  } catch (error) {
    console.error(
      "PUT journey block error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to update content block." },
      { status: 500 }
    );
  }
}