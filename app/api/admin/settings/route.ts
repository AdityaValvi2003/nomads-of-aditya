import { NextResponse } from "next/server";

import { getSession } from "../../../../src/lib/auth";
import { prisma } from "../../../../src/lib/prisma";

import {
    FeatureMode,
} from "../../../../src/generated/prisma/enums";

const MAX_SITE_NAME_LENGTH = 100;
const MAX_OWNER_NAME_LENGTH = 100;
const MAX_ACCENT_COLOR_LENGTH = 20;
const MAX_HEADLINE_LENGTH = 200;
const MAX_SUBHEADLINE_LENGTH = 500;
const MAX_CONTACT_EMAIL_LENGTH = 254;
const MAX_ABOUT_TEXT_LENGTH = 5000;

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
            contactEmail,
            journeyFeatureMode,
            featuredJourneyId,
            blogFeatureMode,
            featuredBlogId,
            aboutHeadline,
            aboutLead,
            aboutStoryTitle,
            aboutStoryLeft,
            aboutStoryRight,
            aboutPhilosophy,
            aboutFreedom,
            aboutExploration,
            aboutPeople,
            aboutGrowth,
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

        if (
            typeof siteName === "string" &&
            siteName.trim().length > MAX_SITE_NAME_LENGTH
        ) {
            return NextResponse.json(
                {
                    error:
                        "Site name must be 100 characters or less.",
                },
                { status: 400 }
            );
        }

        if (
            typeof ownerName === "string" &&
            ownerName.trim().length > MAX_OWNER_NAME_LENGTH
        ) {
            return NextResponse.json(
                {
                    error:
                        "Owner name must be 100 characters or less.",
                },
                { status: 400 }
            );
        }

        if (
            typeof heroHeadline === "string" &&
            heroHeadline.trim().length > MAX_HEADLINE_LENGTH
        ) {
            return NextResponse.json(
                {
                    error:
                        "Hero headline must be 200 characters or less.",
                },
                { status: 400 }
            );
        }

        if (
            typeof heroSubheadline === "string" &&
            heroSubheadline.trim().length > MAX_SUBHEADLINE_LENGTH
        ) {
            return NextResponse.json(
                {
                    error:
                        "Hero subheadline must be 500 characters or less.",
                },
                { status: 400 }
            );
        }

        if (
            typeof contactEmail === "string" &&
            contactEmail.trim().length > MAX_CONTACT_EMAIL_LENGTH
        ) {
            return NextResponse.json(
                {
                    error:
                        "Contact email must be 254 characters or less.",
                },
                { status: 400 }
            );
        }

        if (
            typeof contactEmail === "string" &&
            contactEmail.trim()
        ) {
            const email =
                contactEmail.trim();

            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            if (!emailPattern.test(email)) {
                return NextResponse.json(
                    {
                        error:
                            "Please provide a valid contact email.",
                    },
                    { status: 400 }
                );
            }
        }

        if (
            typeof accentColor === "string" &&
            accentColor.trim()
        ) {
            const colorPattern =
                /^#[0-9A-Fa-f]{6}$/;

            if (
                !colorPattern.test(
                    accentColor.trim()
                )
            ) {
                return NextResponse.json(
                    {
                        error:
                            "Accent color must be a valid 6-digit hex color.",
                    },
                    { status: 400 }
                );
            }
        }
        if (
  typeof featuredJourneyId === "string" &&
  featuredJourneyId.trim()
) {
  const featuredJourney =
    await prisma.journey.findUnique({
      where: {
        id: featuredJourneyId.trim(),
      },
      select: {
        id: true,
      },
    });

  if (!featuredJourney) {
    return NextResponse.json(
      {
        error:
          "Selected featured journey was not found.",
      },
      {
        status: 400,
      }
    );
  }
}
if (
  typeof featuredBlogId === "string" &&
  featuredBlogId.trim()
) {
  const featuredBlog =
    await prisma.blog.findUnique({
      where: {
        id: featuredBlogId.trim(),
      },
      select: {
        id: true,
      },
    });

  if (!featuredBlog) {
    return NextResponse.json(
      {
        error:
          "Selected featured blog was not found.",
      },
      {
        status: 400,
      }
    );
  }
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

            contactEmail:
                typeof contactEmail === "string"
                    ? contactEmail.trim() || null
                    : null,

            aboutHeadline:
                typeof aboutHeadline === "string"
                    ? aboutHeadline.trim() || null
                    : null,

            aboutLead:
                typeof aboutLead === "string"
                    ? aboutLead.trim() || null
                    : null,

            aboutStoryTitle:
                typeof aboutStoryTitle === "string"
                    ? aboutStoryTitle.trim() || null
                    : null,

            aboutStoryLeft:
                typeof aboutStoryLeft === "string"
                    ? aboutStoryLeft.trim() || null
                    : null,

            aboutStoryRight:
                typeof aboutStoryRight === "string"
                    ? aboutStoryRight.trim() || null
                    : null,

            aboutPhilosophy:
                typeof aboutPhilosophy === "string"
                    ? aboutPhilosophy.trim() || null
                    : null,

            aboutFreedom:
                typeof aboutFreedom === "string"
                    ? aboutFreedom.trim() || null
                    : null,

            aboutExploration:
                typeof aboutExploration === "string"
                    ? aboutExploration.trim() || null
                    : null,

            aboutPeople:
                typeof aboutPeople === "string"
                    ? aboutPeople.trim() || null
                    : null,

            aboutGrowth:
                typeof aboutGrowth === "string"
                    ? aboutGrowth.trim() || null
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