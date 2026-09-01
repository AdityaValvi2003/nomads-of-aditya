import { NextResponse } from "next/server";

import { prisma } from "../../../../../src/lib/prisma";
import { getSession } from "../../../../../src/lib/auth";

// ============================================================
// GET — LOAD SINGLE ENCOUNTER
// ============================================================

export async function GET(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

    const encounter = await prisma.encounter.findUnique({
      where: {
        id,
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

    if (!encounter) {
      return NextResponse.json(
        {
          error: "Encounter not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(encounter);
  } catch (error) {
    console.error(
      "GET /api/admin/encounters/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load encounter.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PATCH — UPDATE ENCOUNTER
// ============================================================

export async function PATCH(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

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
    // VALIDATE TITLE
    // --------------------------------------------------------

    if (
      title !== undefined &&
      (
        typeof title !== "string" ||
        !title.trim()
      )
    ) {
      return NextResponse.json(
        {
          error: "Title cannot be empty.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // CHECK EXISTING ENCOUNTER
    // --------------------------------------------------------

    const existingEncounter =
      await prisma.encounter.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existingEncounter) {
      return NextResponse.json(
        {
          error: "Encounter not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // VERIFY JOURNEY
    // --------------------------------------------------------

    if (journeyId !== undefined) {
      if (
        typeof journeyId !== "string" ||
        !journeyId.trim()
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
    }

    // --------------------------------------------------------
    // VERIFY MEDIA
    // --------------------------------------------------------

    if (mediaId !== undefined && mediaId !== null) {
      if (
        typeof mediaId !== "string" ||
        !mediaId.trim()
      ) {
        return NextResponse.json(
          {
            error: "Invalid media selection.",
          },
          {
            status: 400,
          }
        );
      }

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

      // ------------------------------------------------------
      // IMPORTANT:
      // mediaId is UNIQUE in Encounter.
      // Therefore another Encounter cannot use this media.
      // ------------------------------------------------------

      const mediaOwner =
        await prisma.encounter.findFirst({
          where: {
            mediaId,
            NOT: {
              id,
            },
          },
          select: {
            id: true,
            title: true,
          },
        });

      if (mediaOwner) {
        return NextResponse.json(
          {
            error:
              "This media is already assigned to another encounter.",
            encounterId: mediaOwner.id,
            encounterTitle: mediaOwner.title,
          },
          {
            status: 409,
          }
        );
      }
    }

    if (
      featuredOnHomepage !== undefined &&
      typeof featuredOnHomepage !== "boolean"
    ) {
      return NextResponse.json(
        {
          error:
            "featuredOnHomepage must be a boolean.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // BUILD UPDATE DATA
    // --------------------------------------------------------

    const data: {
      title?: string;
      shortIntro?: string | null;
      story?: object;
      featuredOnHomepage?: boolean;
      journeyId?: string;
      mediaId?: string | null;
    } = {};

    if (title !== undefined) {
      data.title = title.trim();
    }

    if (shortIntro !== undefined) {
      data.shortIntro =
        typeof shortIntro === "string" &&
          shortIntro.trim()
          ? shortIntro.trim()
          : null;
    }

    if (
      story !== undefined &&
      story !== null &&
      typeof story === "object"
    ) {
      data.story = story;
    }

    if (featuredOnHomepage !== undefined) {
  data.featuredOnHomepage =
    featuredOnHomepage;
}

    if (journeyId !== undefined) {
      data.journeyId = journeyId;
    }

    if (mediaId !== undefined) {
      data.mediaId =
        typeof mediaId === "string" &&
          mediaId.trim()
          ? mediaId.trim()
          : null;
    }

    // --------------------------------------------------------
    // UPDATE
    // --------------------------------------------------------

    const encounter = await prisma.encounter.update({
      where: {
        id,
      },

      data,

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

    return NextResponse.json(encounter);
  } catch (error) {
    console.error(
      "PATCH /api/admin/encounters/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update encounter.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE — DELETE ENCOUNTER
// ============================================================

export async function DELETE(
  _request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
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

    const { id } = await context.params;

    const existingEncounter =
      await prisma.encounter.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
        },
      });

    if (!existingEncounter) {
      return NextResponse.json(
        {
          error: "Encounter not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.encounter.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/encounters/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete encounter.",
      },
      {
        status: 500,
      }
    );
  }
}