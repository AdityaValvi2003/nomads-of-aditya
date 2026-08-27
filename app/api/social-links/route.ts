import { NextResponse } from "next/server";

import { prisma } from "../../../src/lib/prisma";

export async function GET() {
  try {
    const socialLinks = await prisma.socialLink.findMany({
      where: {
        isActive: true,
      },
      orderBy: {
        position: "asc",
      },
      select: {
        id: true,
        platform: true,
        label: true,
        url: true,
        icon: true,
      },
    });

    return NextResponse.json({
      socialLinks,
    });
  } catch (error) {
    console.error(
      "GET /api/social-links error:",
      error
    );

    return NextResponse.json(
      {
        socialLinks: [],
      },
      { status: 200 }
    );
  }
}