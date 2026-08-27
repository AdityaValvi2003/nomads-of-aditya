import { NextResponse } from "next/server";

import { prisma } from "../../../src/lib/prisma";

export async function GET() {
    try {
        const settings = await prisma.siteSettings.findFirst({
            select: {
                siteName: true,
                ownerName: true,
                contactEmail: true,
                defaultTheme: true,
            },
        });

        return NextResponse.json({
            siteName:
                settings?.siteName?.trim() ||
                "Nomads of Aditya",

            ownerName:
                settings?.ownerName?.trim() ||
                "Aditya Valvi",

            contactEmail:
                settings?.contactEmail?.trim() ||
                "hello@nomadsofaditya.com",

            defaultTheme:
                settings?.defaultTheme === "light"
                    ? "light"
                    : "dark",
        });
    } catch (error) {
        console.error(
            "GET /api/settings error:",
            error
        );

        return NextResponse.json(
            {
                siteName: "Nomads of Aditya",
                ownerName: "Aditya Valvi",
                contactEmail:
                    "hello@nomadsofaditya.com",
                defaultTheme: "dark",
            },
            { status: 200 }
        );
    }
}