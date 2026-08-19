import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { getSession } from "../../../../src/lib/auth";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const media = await prisma.mediaAsset.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        journey: {
          select: {
            id: true,
            title: true,
          },
        },
      },
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error("GET media error:", error);

    return NextResponse.json(
      {
        error: "Failed to load media.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const url =
      typeof body.url === "string"
        ? body.url.trim()
        : "";

    const fileName =
      typeof body.fileName === "string"
        ? body.fileName.trim()
        : "";

    const mimeType =
      typeof body.mimeType === "string"
        ? body.mimeType.trim()
        : "image/jpeg";

    const altText =
      typeof body.altText === "string"
        ? body.altText.trim()
        : "";

    const caption =
      typeof body.caption === "string"
        ? body.caption.trim()
        : "";

    const location =
      typeof body.location === "string"
        ? body.location.trim()
        : "";

    if (!url) {
      return NextResponse.json(
        {
          error: "Image URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        {
          error: "File name is required.",
        },
        {
          status: 400,
        }
      );
    }

    const media = await prisma.mediaAsset.create({
      data: {
        url,
        fileName,
        mimeType,
        altText: altText || null,
        caption: caption || null,
        location: location || null,
      },
    });

    return NextResponse.json(
      media,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("POST media error:", error);

    return NextResponse.json(
      {
        error: "Failed to create media.",
      },
      {
        status: 500,
      }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const id =
      typeof body.id === "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error: "Media ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    await prisma.mediaAsset.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error("DELETE media error:", error);

    return NextResponse.json(
      {
        error: "Failed to delete media.",
      },
      {
        status: 500,
      }
    );
  }
}