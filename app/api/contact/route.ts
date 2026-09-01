import { NextResponse } from "next/server";

import { prisma } from "../../../src/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      name,
      email,
      message,
    } = body;

    // =========================================================
    // VALIDATION
    // =========================================================

    if (
      typeof name !== "string" ||
      !name.trim()
    ) {
      return NextResponse.json(
        {
          error: "Name is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof email !== "string" ||
      !email.trim()
    ) {
      return NextResponse.json(
        {
          error: "Email is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return NextResponse.json(
        {
          error: "Message is required.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // NORMALIZE
    // =========================================================

    const normalizedName =
      name.trim();

    const normalizedEmail =
      email.trim().toLowerCase();

     const normalizedMessage =
      message.trim();

    const rateLimitWindow =
      5 * 60 * 1000;

    const rateLimitSince =
      new Date(
        Date.now() - rateLimitWindow
      );

    const recentMessage =
      await prisma.contactMessage.findFirst({
        where: {
          email: normalizedEmail,
          createdAt: {
            gte: rateLimitSince,
          },
        },
        select: {
          id: true,
          createdAt: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

    if (recentMessage) {
      return NextResponse.json(
        {
          error:
            "Please wait a few minutes before sending another message.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": "300",
          },
        }
      );
    }

    // =========================================================
    // EMAIL VALIDATION
    // =========================================================

    const emailPattern =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (
      !emailPattern.test(
        normalizedEmail
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Please enter a valid email address.",
        },
        {
          status: 400,
        }
      );
    }


    // =========================================================
    // LENGTH VALIDATION
    // =========================================================

    if (normalizedName.length > 100) {
      return NextResponse.json(
        {
          error:
            "Name is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (normalizedEmail.length > 255) {
      return NextResponse.json(
        {
          error:
            "Email address is too long.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      normalizedMessage.length < 10
    ) {
      return NextResponse.json(
        {
          error:
            "Please write a little more in your message.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      normalizedMessage.length > 5000
    ) {
      return NextResponse.json(
        {
          error:
            "Message is too long.",
        },
        {
          status: 400,
        }
      );
    }

    // =========================================================
    // SAVE MESSAGE
    // =========================================================

    const contactMessage =
      await prisma.contactMessage.create({
        data: {
          name: normalizedName,
          email: normalizedEmail,
          message: normalizedMessage,
        },
      });

    // =========================================================
    // RESPONSE
    // =========================================================

    return NextResponse.json(
      {
        message:
          "Your message has been sent successfully.",
        id: contactMessage.id,
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST /api/contact error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Something went wrong while sending your message.",
      },
      {
        status: 500,
      }
    );
  }
}