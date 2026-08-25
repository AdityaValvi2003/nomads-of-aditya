import { NextResponse } from "next/server";

import { getSession } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/prisma";

/* =========================================================
   GET
   List all dream destinations
========================================================= */

export async function GET() {
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

    const destinations =
      await prisma.dreamDestination.findMany({
        orderBy: {
          createdAt: "desc",
        },
      });

    return NextResponse.json(
      destinations
    );
  } catch (error) {
    console.error(
      "Get dream destinations error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load dream destinations.",
      },
      {
        status: 500,
      }
    );
  }
}

/* =========================================================
   POST
   Create dream destination
========================================================= */

export async function POST(
  request: Request
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

    const destination =
      await prisma.dreamDestination.create({
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
      destination,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "Create dream destination error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create dream destination.",
      },
      {
        status: 500,
      }
    );
  }
}