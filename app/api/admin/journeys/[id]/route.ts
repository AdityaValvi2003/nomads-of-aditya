import { del } from "@vercel/blob";
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
    include: {
      media: {
        select: {
          id: true,
          url: true,
        },
      },
    },
  });

    if (!journey) {
      return NextResponse.json(
        { error: "Journey not found." },
        { status: 404 }
      );
    }

    const mediaUrlsToDelete: string[] = [];

for (const media of journey.media) {
  const externalBlock =
    await prisma.contentBlock.findFirst({
      where: {
        mediaId: media.id,
        OR: [
          {
            journeyId: {
              not: journey.id,
            },
          },
          {
            blogId: {
              not: null,
            },
          },
        ],
      },
      select: {
        id: true,
      },
    });

  const externalEncounter =
    await prisma.encounter.findFirst({
      where: {
        mediaId: media.id,
        journeyId: {
          not: journey.id,
        },
      },
      select: {
        id: true,
      },
    });

  const usedByOtherJourney =
    await prisma.journey.findFirst({
      where: {
        id: {
          not: journey.id,
        },
        coverImage: media.url,
      },
      select: {
        id: true,
      },
    });

  const usedByBlog =
    await prisma.blog.findFirst({
      where: {
        coverImage: media.url,
      },
      select: {
        id: true,
      },
    });

  if (
    !externalBlock &&
    !externalEncounter &&
    !usedByOtherJourney &&
    !usedByBlog
  ) {
    mediaUrlsToDelete.push(media.url);
  }
}

for (const url of mediaUrlsToDelete) {
  try {
    await del(url);
  } catch (blobError) {
    console.error(
      "Journey media Blob deletion error:",
      blobError
    );

    return NextResponse.json(
      {
        error:
          "The journey could not be deleted because one or more media files could not be removed from storage.",
      },
      { status: 500 }
    );
  }
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