import { NextResponse } from "next/server";

import { prisma } from "../../../../src/lib/prisma";

import { getSession } from "../../../../src/lib/auth";

import {
  ContentBlockType,
  ContentStatus,
} from "../../../../src/generated/prisma/enums";

// ============================================================
// GET — LOAD ALL BLOG POSTS
// ============================================================

export async function GET() {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const session =
      await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------------
    // LOAD BLOGS
    // --------------------------------------------------------

    const blogs =
      await prisma.blog.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          contentBlocks: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });

    // --------------------------------------------------------
    // FORMAT BLOGS
    // --------------------------------------------------------

    const posts = blogs.map(
      (blog) => {
        const contentText =
          blog.contentBlocks
            .map((block) => {
              const data =
                block.data as {
                  text?: string;
                };

              return (
                data?.text || ""
              );
            })
            .join("\n");

        const wordCount =
          contentText
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

        const readTime =
          Math.max(
            1,
            Math.ceil(
              wordCount / 200
            )
          );

        return {
          id: blog.id,

          title: blog.title,

          slug: blog.slug,

          excerpt:
            blog.shortIntro ||
            blog.subtitle ||
            "",

          category:
            blog.subtitle ||
            "Travel",

          status:
            blog.status,

          date:
            blog.publishedAt
              ? blog.publishedAt.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                )
              : blog.createdAt.toLocaleDateString(
                  "en-IN",
                  {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }
                ),

          readTime:
            `${readTime} min read`,

          featured:
            blog.isFeatured,

          // IMPORTANT
          coverImage:
            blog.coverImage,

          author:
            blog.author,

          createdAt:
            blog.createdAt,

          updatedAt:
            blog.updatedAt,

          publishedAt:
            blog.publishedAt,
        };
      }
    );

    return NextResponse.json(
      posts
    );
  } catch (error) {
    console.error(
      "GET /api/admin/blog error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load blog posts.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// POST — CREATE NEW BLOG POST
// ============================================================

export async function POST(
  request: Request
) {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const session =
      await getSession();

    if (!session) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------------

    const body =
      await request.json();

    const {
      title,
      slug,
      subtitle,
      shortIntro,
      status,
      isFeatured,
      content,

      // IMPORTANT
      coverImage,
    } = body;

    // --------------------------------------------------------
    // VALIDATION
    // --------------------------------------------------------

    if (
      typeof title !== "string" ||
      !title.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Title is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      typeof slug !== "string" ||
      !slug.trim()
    ) {
      return NextResponse.json(
        {
          error:
            "Slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      status !== "Draft" &&
      status !== "Published"
    ) {
      return NextResponse.json(
        {
          error:
            "Status must be Draft or Published.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // COVER IMAGE VALIDATION
    // --------------------------------------------------------

    let finalCoverImage:
      string | null = null;

    if (
      typeof coverImage ===
        "string" &&
      coverImage.trim()
    ) {
      finalCoverImage =
        coverImage.trim();
    }

    // --------------------------------------------------------
    // CHECK SLUG
    // --------------------------------------------------------

    const existingBlog =
      await prisma.blog.findUnique({
        where: {
          slug: slug.trim(),
        },
      });

    if (existingBlog) {
      return NextResponse.json(
        {
          error:
            "A blog post with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------------
    // VERIFY AUTHOR
    // --------------------------------------------------------

    const author =
      await prisma.user.findUnique({
        where: {
          id: session.userId,
        },
      });

    if (!author) {
      return NextResponse.json(
        {
          error:
            "The logged-in user could not be found.",
        },
        {
          status: 401,
        }
      );
    }

    // --------------------------------------------------------
    // MAP STATUS
    // --------------------------------------------------------

    const prismaStatus =
      status === "Published"
        ? ContentStatus.PUBLISHED
        : ContentStatus.DRAFT;

    // --------------------------------------------------------
    // CREATE BLOG
    // --------------------------------------------------------

    const blog =
      await prisma.blog.create({
        data: {
          // --------------------------------------------------
          // BASIC
          // --------------------------------------------------

          title:
            title.trim(),

          slug:
            slug.trim(),

          // --------------------------------------------------
          // CATEGORY
          // --------------------------------------------------

          subtitle:
            typeof subtitle ===
              "string" &&
            subtitle.trim()
              ? subtitle.trim()
              : null,

          // --------------------------------------------------
          // DESCRIPTION
          // --------------------------------------------------

          shortIntro:
            typeof shortIntro ===
              "string" &&
            shortIntro.trim()
              ? shortIntro.trim()
              : null,

          // --------------------------------------------------
          // STATUS
          // --------------------------------------------------

          status:
            prismaStatus,

          // --------------------------------------------------
          // FEATURED
          // --------------------------------------------------

          isFeatured:
            typeof isFeatured ===
            "boolean"
              ? isFeatured
              : false,

          // --------------------------------------------------
          // COVER IMAGE
          // --------------------------------------------------

          coverImage:
            finalCoverImage,

          // --------------------------------------------------
          // AUTHOR
          // --------------------------------------------------

          authorId:
            author.id,

          // --------------------------------------------------
          // PUBLISHED DATE
          // --------------------------------------------------

          publishedAt:
            prismaStatus ===
            ContentStatus.PUBLISHED
              ? new Date()
              : null,

          // --------------------------------------------------
          // CONTENT
          // --------------------------------------------------

          contentBlocks:
            typeof content ===
                "string" &&
              content.trim()
              ? {
                  create: {
                    type:
                      ContentBlockType.PARAGRAPH,

                    position: 0,

                    data: {
                      text:
                        content,
                    },
                  },
                }
              : undefined,
        },

        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          contentBlocks: {
            orderBy: {
              position: "asc",
            },
          },
        },
      });

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json(
      {
        message:
          status ===
          "Published"
            ? "Blog post published successfully."
            : "Blog draft saved successfully.",

        blog,
      },
      {
        status: 201,
      }
    );
  } catch (error: unknown) {
    console.error(
      "POST /api/admin/blog error:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE SLUG
    // --------------------------------------------------------

    if (
      typeof error ===
        "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error:
            "A blog post with this slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    // --------------------------------------------------------
    // GENERAL ERROR
    // --------------------------------------------------------

    return NextResponse.json(
      {
        error:
          "Failed to create blog post.",
      },
      {
        status: 500,
      }
    );
  }
}