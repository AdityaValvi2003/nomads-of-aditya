import { NextResponse } from "next/server";

import { prisma } from "../../../../src/lib/prisma";
import { getSession } from "../../../../src/lib/auth";

// ============================================================
// GET — LOAD ALL ENCOUNTERS
// ============================================================

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const encounters = await prisma.encounter.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        journey: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },

        media: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            fileName: true,
            altText: true,
          },
        },
      },
    });

    return NextResponse.json(encounters);
  } catch (error) {
    console.error(
      "GET /api/admin/encounters error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load encounters.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST — CREATE ENCOUNTER
// ============================================================

export async function POST(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const body = await request.json();

    const {
      title,
      shortIntro,
      story,
      featuredOnHomepage,
      journeyId,
      mediaId,
    } = body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      !title ||
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          error: "Title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      !journeyId ||
      typeof journeyId !== "string"
    ) {
      return NextResponse.json(
        {
          error: "Journey is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // VERIFY JOURNEY
    // --------------------------------------------------------

    const journey = await prisma.journey.findUnique({
      where: {
        id: journeyId,
      },
      select: {
        id: true,
      },
    });

    if (!journey) {
      return NextResponse.json(
        {
          error: "Selected journey does not exist.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // VERIFY MEDIA IF PROVIDED
    // --------------------------------------------------------

    if (mediaId) {
      const media = await prisma.mediaAsset.findUnique({
        where: {
          id: mediaId,
        },
        select: {
          id: true,
        },
      });

      if (!media) {
        return NextResponse.json(
          {
            error: "Selected media does not exist.",
          },
          {
            status: 400,
          }
        );
      }
    }

    // --------------------------------------------------------
    // CREATE
    // --------------------------------------------------------

    const encounter = await prisma.encounter.create({
      data: {
        title: title.trim(),

        shortIntro:
          typeof shortIntro === "string" &&
          shortIntro.trim()
            ? shortIntro.trim()
            : null,

        story:
          story &&
          typeof story === "object"
            ? story
            : {},

        featuredOnHomepage:
          Boolean(featuredOnHomepage),

        journeyId,

        mediaId:
          typeof mediaId === "string" &&
          mediaId.trim()
            ? mediaId.trim()
            : null,
      },

      include: {
        journey: {
          select: {
            id: true,
            title: true,
            slug: true,
          },
        },

        media: {
          select: {
            id: true,
            url: true,
            thumbnailUrl: true,
            fileName: true,
            altText: true,
          },
        },
      },
    });

    return NextResponse.json(
      encounter,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/encounters error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create encounter.",
      },
      {
        status: 500,
      }
    );
  }
}