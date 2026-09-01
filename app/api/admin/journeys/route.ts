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

    const journeys = await prisma.journey.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(journeys);
  } catch (error) {
    console.error("GET journeys error:", error);

    return NextResponse.json(
      { error: "Failed to load journeys." },
      { status: 500 }
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

    const title = String(body.title || "").trim();
    const location = String(body.location || "").trim();
    const country = String(body.country || "").trim();
    const slug = String(body.slug || "")
  .trim()
  .toLowerCase();

    const shortIntro = String(
      body.shortIntro || ""
    ).trim();

    const journeyDateValue = String(
      body.journeyDate || ""
    ).trim();

    const duration = String(
      body.duration || ""
    ).trim();

    const distance = String(
      body.distance || ""
    ).trim();

    const difficulty = String(
      body.difficulty || ""
    ).trim();

    const companions = String(
      body.companions || ""
    ).trim();

    const placesVisited = String(
      body.placesVisited || ""
    ).trim();

    const statusValue =
  typeof body.status === "string"
    ? body.status.trim()
    : "DRAFT";

if (
  statusValue !== "DRAFT" &&
  statusValue !== "PUBLISHED" &&
  statusValue !== "ARCHIVED"
) {
  return NextResponse.json(
    {
      error: "Invalid journey status.",
    },
    {
      status: 400,
    }
  );
}

const status =
  statusValue as
    | "DRAFT"
    | "PUBLISHED"
    | "ARCHIVED";

    if (
      !title ||
      !location ||
      !country ||
      !slug
    ) {
      return NextResponse.json(
        {
          error:
            "Title, slug, location and country are required.",
        },
        { status: 400 }
      );
    }
    const slugPattern =
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

if (!slugPattern.test(slug)) {
  return NextResponse.json(
    {
      error:
        "Slug must contain only lowercase letters, numbers, and single hyphens.",
    },
    { status: 400 }
  );
}

if (
  slug.length < 2 ||
  slug.length > 120
) {
  return NextResponse.json(
    {
      error:
        "Slug must be between 2 and 120 characters.",
    },
    { status: 400 }
  );
}

    const existingJourney =
      await prisma.journey.findUnique({
        where: {
          slug,
        },
      });

    if (existingJourney) {
      return NextResponse.json(
        {
          error:
            "A journey with this slug already exists.",
        },
        { status: 409 }
      );
    }

    let journeyDate: Date | null = null;

    if (journeyDateValue) {
      journeyDate = new Date(
        `${journeyDateValue}T00:00:00`
      );

      if (Number.isNaN(journeyDate.getTime())) {
        return NextResponse.json(
          { error: "Invalid journey date." },
          { status: 400 }
        );
      }
    }

    const journey = await prisma.journey.create({
      data: {
        title,
        slug,
        location,
        country,

        shortIntro:
          shortIntro || null,

        journeyDate,

        duration:
          duration || null,

        distance:
          distance || null,

        difficulty:
          difficulty || null,

        companions:
          companions || null,

        placesVisited:
          placesVisited || null,

        status,

        author: {
          connect: {
            id: session.userId,
          },
        },

        publishedAt:
          status === "PUBLISHED"
            ? new Date()
            : null,
      },
    });

    return NextResponse.json(
      journey,
      { status: 201 }
    );
  } catch (error) {
    console.error("POST journey error:", error);

    return NextResponse.json(
      { error: "Failed to create journey." },
      { status: 500 }
    );
  }
}