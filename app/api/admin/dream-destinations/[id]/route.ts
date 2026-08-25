import { NextResponse } from "next/server";

import { getSession } from "../../../../../src/lib/auth";
import { prisma } from "../../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

/* =========================================================
   GET
========================================================= */

export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const destination =
      await prisma.dreamDestination.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!destination) {
      return NextResponse.json(
        {
          error:
            "Dream destination not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      destination
    );
  } catch (error) {
    console.error(
      "Get dream destination error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load dream destination.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   PATCH
========================================================= */

export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const body =
      await request.json();

    const name =
      typeof body.name === "string"
        ? body.name.trim()
        : "";

    const country =
      typeof body.country === "string"
        ? body.country.trim()
        : "";

    const coverImage =
      typeof body.coverImage === "string"
        ? body.coverImage.trim()
        : null;

    const shortNote =
      typeof body.shortNote === "string"
        ? body.shortNote.trim()
        : null;

    const whyVisit =
      typeof body.whyVisit === "string"
        ? body.whyVisit.trim()
        : null;

    const interests =
      typeof body.interests === "string"
        ? body.interests.trim()
        : null;

    if (!name) {
      return NextResponse.json(
        {
          error:
            "Destination name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!country) {
      return NextResponse.json(
        {
          error:
            "Country is required.",
        },
        {
          status: 400,
        }
      );
    }

    const existing =
      await prisma.dreamDestination.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Dream destination not found.",
        },
        {
          status: 404,
        }
      );
    }

    const destination =
      await prisma.dreamDestination.update({
        where: {
          id,
        },

        data: {
          name,
          country,
          coverImage:
            coverImage || null,
          shortNote:
            shortNote || null,
          whyVisit:
            whyVisit || null,
          interests:
            interests || null,
        },
      });

    return NextResponse.json(
      destination
    );
  } catch (error) {
    console.error(
      "Update dream destination error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update dream destination.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized.",
        },
        {
          status: 401,
        }
      );
    }

    const { id } =
      await context.params;

    const existing =
      await prisma.dreamDestination.findUnique(
        {
          where: {
            id,
          },
        }
      );

    if (!existing) {
      return NextResponse.json(
        {
          error:
            "Dream destination not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.dreamDestination.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "Delete dream destination error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete dream destination.",
      },
      {
        status: 500,
      }
    );
  }
}