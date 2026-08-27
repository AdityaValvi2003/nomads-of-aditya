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

    const socialLinks =
      await prisma.socialLink.findMany({
        orderBy: {
          position: "asc",
        },
      });

    return NextResponse.json({
      socialLinks,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/social-links error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load social links.",
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request
) {
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
      platform,
      label,
      url,
      icon,
      position,
      isActive,
    } = body;

    if (
      typeof platform !== "string" ||
      !platform.trim()
    ) {
      return NextResponse.json(
        { error: "Platform is required." },
        { status: 400 }
      );
    }

    if (
      typeof label !== "string" ||
      !label.trim()
    ) {
      return NextResponse.json(
        { error: "Label is required." },
        { status: 400 }
      );
    }

    if (
      typeof url !== "string" ||
      !url.trim()
    ) {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    const socialLink =
      await prisma.socialLink.create({
        data: {
          platform: platform.trim(),
          label: label.trim(),
          url: url.trim(),
          icon:
            typeof icon === "string" &&
            icon.trim()
              ? icon.trim()
              : null,
          position:
            typeof position === "number"
              ? position
              : 0,
          isActive:
            typeof isActive === "boolean"
              ? isActive
              : true,
        },
      });

    return NextResponse.json(
      {
        message: "Social link created successfully.",
        socialLink,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "POST /api/admin/social-links error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create social link.",
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request
) {
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
      id,
      platform,
      label,
      url,
      icon,
      position,
      isActive,
    } = body;

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      return NextResponse.json(
        { error: "Social link ID is required." },
        { status: 400 }
      );
    }

    if (
      typeof platform !== "string" ||
      !platform.trim()
    ) {
      return NextResponse.json(
        { error: "Platform is required." },
        { status: 400 }
      );
    }

    if (
      typeof label !== "string" ||
      !label.trim()
    ) {
      return NextResponse.json(
        { error: "Label is required." },
        { status: 400 }
      );
    }

    if (
      typeof url !== "string" ||
      !url.trim()
    ) {
      return NextResponse.json(
        { error: "URL is required." },
        { status: 400 }
      );
    }

    const socialLink =
      await prisma.socialLink.update({
        where: {
          id: id.trim(),
        },
        data: {
          platform: platform.trim(),
          label: label.trim(),
          url: url.trim(),
          icon:
            typeof icon === "string" &&
            icon.trim()
              ? icon.trim()
              : null,
          position:
            typeof position === "number"
              ? position
              : 0,
          isActive:
            typeof isActive === "boolean"
              ? isActive
              : true,
        },
      });

    return NextResponse.json({
      message: "Social link updated successfully.",
      socialLink,
    });
  } catch (error) {
    console.error(
      "PUT /api/admin/social-links error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update social link.",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();

    const { id } = body;

    if (
      typeof id !== "string" ||
      !id.trim()
    ) {
      return NextResponse.json(
        { error: "Social link ID is required." },
        { status: 400 }
      );
    }

    await prisma.socialLink.delete({
      where: {
        id: id.trim(),
      },
    });

    return NextResponse.json({
      message: "Social link deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/social-links error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to delete social link.",
      },
      { status: 500 }
    );
  }
}