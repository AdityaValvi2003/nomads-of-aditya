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