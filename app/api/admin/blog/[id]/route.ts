import { NextResponse } from "next/server";
import { prisma } from "../../../../../src/lib/prisma";
import { getSession } from "../../../../../src/lib/auth";
import {
  ContentBlockType,
  ContentStatus,
} from "../../../../../src/generated/prisma/enums";

// ============================================================
// GET — LOAD ONE BLOG POST
// ============================================================

export async function GET(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const session = await getSession();

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
    // PARAMS
    // --------------------------------------------------------

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Blog ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // LOAD BLOG
    // --------------------------------------------------------

    const blog = await prisma.blog.findUnique({
      where: {
        id,
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
    // NOT FOUND
    // --------------------------------------------------------

    if (!blog) {
      return NextResponse.json(
        {
          error: "Blog post not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // CONVERT CONTENT BLOCKS TO EDITOR CONTENT
    // --------------------------------------------------------

    const content = blog.contentBlocks
      .map((block) => {
        const data = block.data as {
          text?: string;
        };

        return data?.text || "";
      })
      .join("\n\n");

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json({
      id: blog.id,
      title: blog.title,
      slug: blog.slug,

      excerpt: blog.shortIntro || "",

      category: blog.subtitle || "Travel",

      status: blog.status,

      featured: blog.isFeatured,

      coverImage: blog.coverImage,

      content,

      author: blog.author,

      date: blog.publishedAt || blog.createdAt,

      createdAt: blog.createdAt,
      updatedAt: blog.updatedAt,
      publishedAt: blog.publishedAt,
    });
  } catch (error) {
    console.error(
      "GET /api/admin/blog/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to load blog post.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// PUT — UPDATE ONE BLOG POST
// ============================================================

export async function PUT(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const session = await getSession();

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
    // PARAMS
    // --------------------------------------------------------

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Blog ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // REQUEST BODY
    // --------------------------------------------------------

    const body = await request.json();

    const {
      title,
      slug,
      subtitle,
      shortIntro,
      status,
      isFeatured,
      content,
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
          error: "Title is required.",
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
          error: "Slug is required.",
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
    // CHECK BLOG EXISTS
    // --------------------------------------------------------

    const existingBlog =
      await prisma.blog.findUnique({
        where: {
          id,
        },
      });

    if (!existingBlog) {
      return NextResponse.json(
        {
          error: "Blog post not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // CHECK SLUG
    // --------------------------------------------------------

    const slugOwner =
      await prisma.blog.findUnique({
        where: {
          slug: slug.trim(),
        },
      });

    if (
      slugOwner &&
      slugOwner.id !== id
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
    // MAP STATUS
    // --------------------------------------------------------

    const prismaStatus =
      status === "Published"
        ? ContentStatus.PUBLISHED
        : ContentStatus.DRAFT;

    // --------------------------------------------------------
    // COVER IMAGE
    // --------------------------------------------------------

    let normalizedCoverImage:
      | string
      | null;

    if (typeof coverImage === "string") {
      normalizedCoverImage =
        coverImage.trim() || null;
    } else if (coverImage === null) {
      normalizedCoverImage = null;
    } else {
      normalizedCoverImage =
        existingBlog.coverImage;
    }

    // --------------------------------------------------------
    // UPDATE BLOG + CONTENT
    // --------------------------------------------------------

    const blog =
      await prisma.$transaction(
        async (tx) => {
          // ----------------------------------------------
          // DELETE OLD CONTENT BLOCKS
          // ----------------------------------------------

          await tx.contentBlock.deleteMany({
            where: {
              blogId: id,
            },
          });

          // ----------------------------------------------
          // UPDATE BLOG
          // ----------------------------------------------

          await tx.blog.update({
            where: {
              id,
            },

            data: {
              title: title.trim(),

              slug: slug.trim(),

              subtitle:
                typeof subtitle === "string" &&
                subtitle.trim()
                  ? subtitle.trim()
                  : null,

              shortIntro:
                typeof shortIntro === "string" &&
                shortIntro.trim()
                  ? shortIntro.trim()
                  : null,

              status: prismaStatus,

              isFeatured:
                typeof isFeatured === "boolean"
                  ? isFeatured
                  : false,

              coverImage:
                normalizedCoverImage,

              publishedAt:
                prismaStatus ===
                ContentStatus.PUBLISHED
                  ? existingBlog.publishedAt ||
                    new Date()
                  : null,
            },
          });

          // ----------------------------------------------
          // CREATE NEW CONTENT BLOCK
          // ----------------------------------------------

          if (
            typeof content === "string" &&
            content.trim()
          ) {
            await tx.contentBlock.create({
              data: {
                type:
                  ContentBlockType.PARAGRAPH,

                position: 0,

                data: {
                  text: content,
                },

                blogId: id,
              },
            });
          }

          // ----------------------------------------------
          // RETURN UPDATED BLOG
          // ----------------------------------------------

          return tx.blog.findUnique({
            where: {
              id,
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
        }
      );

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json({
      message:
        status === "Published"
          ? "Blog post published successfully."
          : "Blog post updated successfully.",

      blog,
    });
  } catch (error: unknown) {
    console.error(
      "PUT /api/admin/blog/[id] error:",
      error
    );

    // --------------------------------------------------------
    // DUPLICATE SLUG
    // --------------------------------------------------------

    if (
      typeof error === "object" &&
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
          "Failed to update blog post.",
      },
      {
        status: 500,
      }
    );
  }
}

// ============================================================
// DELETE — DELETE ONE BLOG POST
// ============================================================

export async function DELETE(
  request: Request,
  context: {
    params: Promise<{ id: string }>;
  }
) {
  try {
    // --------------------------------------------------------
    // AUTHENTICATION
    // --------------------------------------------------------

    const session = await getSession();

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
    // PARAMS
    // --------------------------------------------------------

    const { id } = await context.params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Blog ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    // --------------------------------------------------------
    // CHECK BLOG
    // --------------------------------------------------------

    const blog =
      await prisma.blog.findUnique({
        where: {
          id,
        },
      });

    if (!blog) {
      return NextResponse.json(
        {
          error: "Blog post not found.",
        },
        {
          status: 404,
        }
      );
    }

    // --------------------------------------------------------
    // DELETE
    // --------------------------------------------------------

    await prisma.blog.delete({
      where: {
        id,
      },
    });

    // --------------------------------------------------------
    // RESPONSE
    // --------------------------------------------------------

    return NextResponse.json({
      message:
        "Blog post deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE /api/admin/blog/[id] error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete blog post.",
      },
      {
        status: 500,
      }
    );
  }
}