import { NextResponse } from "next/server";

import { getSession } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/prisma";

import {
  FeatureMode,
} from "../../../../src/generated/prisma/enums";

export async function GET() {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      settings = await prisma.siteSettings.create({
        data: {},
      });
    }

    return NextResponse.json(settings);
  } catch (error) {
    console.error(
      "GET /api/admin/settings error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to load settings." },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const {
      siteName,
      ownerName,
      defaultTheme,
      accentColor,
      heroHeadline,
      heroSubheadline,
      journeyFeatureMode,
      featuredJourneyId,
      blogFeatureMode,
      featuredBlogId,
    } = body;

    if (
      defaultTheme !== undefined &&
      defaultTheme !== "dark" &&
      defaultTheme !== "light"
    ) {
      return NextResponse.json(
        { error: "Invalid theme." },
        { status: 400 }
      );
    }

    if (
      journeyFeatureMode !== undefined &&
      journeyFeatureMode !== "AUTOMATIC" &&
      journeyFeatureMode !== "MANUAL"
    ) {
      return NextResponse.json(
        { error: "Invalid journey feature mode." },
        { status: 400 }
      );
    }

    if (
      blogFeatureMode !== undefined &&
      blogFeatureMode !== "AUTOMATIC" &&
      blogFeatureMode !== "MANUAL"
    ) {
      return NextResponse.json(
        { error: "Invalid blog feature mode." },
        { status: 400 }
      );
    }

    const existing = await prisma.siteSettings.findFirst();

    const data = {
      siteName:
        typeof siteName === "string" && siteName.trim()
          ? siteName.trim()
          : "Nomads of Aditya",

      ownerName:
        typeof ownerName === "string" && ownerName.trim()
          ? ownerName.trim()
          : "Aditya Valvi",

      defaultTheme:
        typeof defaultTheme === "string"
          ? defaultTheme
          : "dark",

      accentColor:
        typeof accentColor === "string" && accentColor.trim()
          ? accentColor.trim()
          : "#D99A3D",

      heroHeadline:
        typeof heroHeadline === "string"
          ? heroHeadline.trim() || null
          : null,

      heroSubheadline:
        typeof heroSubheadline === "string"
          ? heroSubheadline.trim() || null
          : null,

      journeyFeatureMode:
  journeyFeatureMode === "MANUAL"
    ? FeatureMode.MANUAL
    : FeatureMode.AUTOMATIC,

      featuredJourneyId:
        typeof featuredJourneyId === "string" &&
        featuredJourneyId.trim()
          ? featuredJourneyId.trim()
          : null,

      blogFeatureMode:
  blogFeatureMode === "MANUAL"
    ? FeatureMode.MANUAL
    : FeatureMode.AUTOMATIC,

      featuredBlogId:
        typeof featuredBlogId === "string" &&
        featuredBlogId.trim()
          ? featuredBlogId.trim()
          : null,
    };

    const settings = existing
      ? await prisma.siteSettings.update({
          where: {
            id: existing.id,
          },
          data,
        })
      : await prisma.siteSettings.create({
          data,
        });

    return NextResponse.json({
      message: "Settings saved successfully.",
      settings,
    });
  } catch (error) {
    console.error(
      "PUT /api/admin/settings error:",
      error
    );

    return NextResponse.json(
      { error: "Failed to save settings." },
      { status: 500 }
    );
  }
}