import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { getSession } from "../../../../src/lib/auth";


const MAX_ALT_TEXT_LENGTH = 250;
const MAX_CAPTION_LENGTH = 1000;
const MAX_LOCATION_LENGTH = 200;
const MAX_PHOTOGRAPHER_LENGTH = 200;

/*
 * ============================================================
 * GET — LOAD MEDIA LIBRARY
 * ============================================================
 */

export async function GET() {
  try {
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

    /*
     * ----------------------------------------------------------
     * LOAD MEDIA
     * ----------------------------------------------------------
     */

    const media =
      await prisma.mediaAsset.findMany({
        orderBy: {
          createdAt: "desc",
        },

        include: {
          journey: {
            select: {
              id: true,
              title: true,
            },
          },

          blocks: {
            select: {
              id: true,
              type: true,

              journey: {
                select: {
                  id: true,
                  title: true,
                },
              },

              blog: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },

          encounter: {
            select: {
              id: true,
              title: true,

              journey: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

    /*
     * ----------------------------------------------------------
     * LOAD JOURNEY COVERS
     * ----------------------------------------------------------
     */

    const journeyCovers =
      await prisma.journey.findMany({
        where: {
          coverImage: {
            not: null,
          },
        },

        select: {
          id: true,
          title: true,
          coverImage: true,
        },
      });

    /*
     * ----------------------------------------------------------
     * LOAD BLOG COVERS
     * ----------------------------------------------------------
     */

    const blogCovers =
      await prisma.blog.findMany({
        where: {
          coverImage: {
            not: null,
          },
        },

        select: {
          id: true,
          title: true,
          coverImage: true,
        },
      });

    /*
     * ----------------------------------------------------------
     * BUILD USAGE
     * ----------------------------------------------------------
     */

    const mediaWithUsage =
      media.map((item) => {
        const usage: Array<{
          type:
          | "JOURNEY"
          | "JOURNEY_COVER"
          | "BLOG_COVER"
          | "CONTENT_BLOCK"
          | "ENCOUNTER";

          id: string;

          title?: string;

          blockType?: string;

          journeyId?: string;

          journeyTitle?: string;
        }> = [];

        /*
         * JOURNEY ASSIGNMENT
         */

        if (item.journey) {
          usage.push({
            type: "JOURNEY",

            id:
              item.journey.id,

            title:
              item.journey.title,
          });
        }

        /*
         * JOURNEY COVER
         */

        for (
          const journey of journeyCovers
        ) {
          if (
            journey.coverImage ===
            item.url
          ) {
            usage.push({
              type:
                "JOURNEY_COVER",

              id:
                journey.id,

              title:
                journey.title,
            });
          }
        }

        /*
         * BLOG COVER
         */

        for (
          const blog of blogCovers
        ) {
          if (
            blog.coverImage ===
            item.url
          ) {
            usage.push({
              type:
                "BLOG_COVER",

              id:
                blog.id,

              title:
                blog.title,
            });
          }
        }

        /*
         * CONTENT BLOCKS
         */

        for (
          const block of item.blocks
        ) {
          usage.push({
            type:
              "CONTENT_BLOCK",

            id:
              block.id,

            title:
              block.blog?.title,

            blockType:
              block.type,

            journeyId:
              block.journey?.id,

            journeyTitle:
              block.journey?.title,
          });
        }

        /*
         * ENCOUNTER
         */

        if (item.encounter) {
          usage.push({
            type:
              "ENCOUNTER",

            id:
              item.encounter.id,

            title:
              item.encounter.title,

            journeyId:
              item.encounter
                .journey?.id,

            journeyTitle:
              item.encounter
                .journey?.title,
          });
        }

        return {
          ...item,

          usage,

          usageCount:
            usage.length,

          isUsed:
            usage.length > 0,
        };
      });

    return NextResponse.json(
      mediaWithUsage
    );
  } catch (error) {
    console.error(
      "GET media error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load media.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * POST — UPLOAD MEDIA
 * ============================================================
 */

export async function POST(
  request: Request
) {
  try {
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

    /*
     * ----------------------------------------------------------
     * FORM DATA
     * ----------------------------------------------------------
     */

    const formData =
      await request.formData();

    const file =
      formData.get("file");

    const altText =
      typeof formData.get(
        "altText"
      ) === "string"
        ? String(
          formData.get(
            "altText"
          )
        ).trim()
        : "";

    const caption =
      typeof formData.get(
        "caption"
      ) === "string"
        ? String(
          formData.get(
            "caption"
          )
        ).trim()
        : "";

    const location =
      typeof formData.get(
        "location"
      ) === "string"
        ? String(
          formData.get(
            "location"
          )
        ).trim()
        : "";

    const photographer =
      typeof formData.get(
        "photographer"
      ) === "string"
        ? String(
          formData.get(
            "photographer"
          )
        ).trim()
        : "";

    const capturedDateValue =
      typeof formData.get(
        "capturedDate"
      ) === "string"
        ? String(
          formData.get(
            "capturedDate"
          )
        ).trim()
        : "";

    const journeyIdValue =
      typeof formData.get(
        "journeyId"
      ) === "string"
        ? String(
          formData.get(
            "journeyId"
          )
        ).trim()
        : "";
    const MAX_ALT_TEXT_LENGTH = 250;
    const MAX_CAPTION_LENGTH = 1000;
    const MAX_LOCATION_LENGTH = 200;
    const MAX_PHOTOGRAPHER_LENGTH = 200;

    if (altText.length > MAX_ALT_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Alt text must be 250 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (caption.length > MAX_CAPTION_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Caption must be 1000 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (location.length > MAX_LOCATION_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Location must be 200 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      photographer.length >
      MAX_PHOTOGRAPHER_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Photographer name must be 200 characters or less.",
        },
        {
          status: 400,
        }
      );
    }
    /*
     * ----------------------------------------------------------
     * VALIDATE FILE
     * ----------------------------------------------------------
     */

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error:
            "Please select an image file.",
        },
        {
          status: 400,
        }
      );
    }

    const allowedImageTypes = new Set([
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/gif",
    ]);

    if (!allowedImageTypes.has(file.type)) {
      return NextResponse.json(
        {
          error:
            "Only JPEG, PNG, WebP, and GIF images are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      file.size >
      10 * 1024 * 1024
    ) {
      return NextResponse.json(
        {
          error:
            "Image must be smaller than 10 MB.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * ALT TEXT
     * ----------------------------------------------------------
     */

    if (!altText) {
      return NextResponse.json(
        {
          error:
            "Alt text is required.",
        },
        {
          status: 400,
        }
      );
    }
    if (altText.length > MAX_ALT_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Alt text must be 250 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (caption.length > MAX_CAPTION_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Caption must be 1000 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (location.length > MAX_LOCATION_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Location must be 200 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      photographer.length >
      MAX_PHOTOGRAPHER_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Photographer name must be 200 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * VALIDATE JOURNEY
     * ----------------------------------------------------------
     */

    let journeyId:
      | string
      | null = null;

    if (journeyIdValue) {
      const journey =
        await prisma.journey.findUnique({
          where: {
            id:
              journeyIdValue,
          },

          select: {
            id: true,
          },
        });

      if (!journey) {
        return NextResponse.json(
          {
            error:
              "Selected journey was not found.",
          },
          {
            status: 400,
          }
        );
      }

      journeyId =
        journey.id;
    }

    /*
     * ----------------------------------------------------------
     * UPLOAD TO VERCEL BLOB
     * ----------------------------------------------------------
     */

    const originalFileName =
      file.name
        .split(/[\\/]/)
        .pop() || "image";

    const safeFileName =
      originalFileName
        .replace(
          /[^a-zA-Z0-9._-]/g,
          "-"
        )
        .replace(
          /-+/g,
          "-"
        )
        .slice(0, 120);

    const uploadFileName =
      safeFileName || "image";

    const blob =
  await put(
    uploadFileName,
    file,
    {
      access: "public",

      addRandomSuffix:
        true,
    }
  );

    /*
     * ----------------------------------------------------------
     * CAPTURE DATE
     * ----------------------------------------------------------
     */

    let capturedDate:
      | Date
      | null = null;

    if (capturedDateValue) {
      const parsedDate =
        new Date(
          `${capturedDateValue}T00:00:00`
        );

      if (
        !Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        capturedDate =
          parsedDate;
      }
    }

    /*
     * ----------------------------------------------------------
     * CREATE MEDIA
     * ----------------------------------------------------------
     */

    const media =
      await prisma.mediaAsset.create({
        data: {
          url:
            blob.url,

          fileName:
            blob.pathname,

          mimeType:
            file.type,

          fileSize:
            file.size,

          altText:
            altText || null,

          caption:
            caption || null,

          location:
            location || null,

          photographer:
            photographer ||
            "Aditya Valvi",

          capturedDate,

          journeyId,

          thumbnailUrl:
            null,

          width:
            null,

          height:
            null,
        },

        include: {
          journey: {
            select: {
              id: true,
              title: true,
            },
          },

          blocks: true,

          encounter: true,
        },
      });

    /*
     * Newly uploaded media has no
     * cover/content/encounter references yet.
     */

    return NextResponse.json(
      {
        ...media,

        usage:
          media.journey
            ? [
              {
                type:
                  "JOURNEY",

                id:
                  media
                    .journey
                    .id,

                title:
                  media
                    .journey
                    .title,
              },
            ]
            : [],

        usageCount:
          media.journey
            ? 1
            : 0,

        isUsed:
          Boolean(
            media.journey
          ),
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST media error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to upload media.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * PATCH — UPDATE MEDIA METADATA
 * ============================================================
 */

export async function PATCH(
  request: Request
) {
  try {
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

    /*
     * ----------------------------------------------------------
     * REQUEST BODY
     * ----------------------------------------------------------
     */

    const body =
      await request.json();

    const id =
      typeof body.id ===
        "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Media ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * FIND MEDIA
     * ----------------------------------------------------------
     */

    const existingMedia =
      await prisma.mediaAsset.findUnique({
        where: {
          id,
        },
      });

    if (!existingMedia) {
      return NextResponse.json(
        {
          error:
            "Media not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * NORMALIZE FIELDS
     * ----------------------------------------------------------
     */

    const altText =
      typeof body.altText ===
        "string"
        ? body.altText.trim()
        : "";

    const caption =
      typeof body.caption ===
        "string"
        ? body.caption.trim()
        : "";

    const location =
      typeof body.location ===
        "string"
        ? body.location.trim()
        : "";

    const photographer =
      typeof body.photographer ===
        "string"
        ? body.photographer.trim()
        : "";

    const journeyIdValue =
      typeof body.journeyId ===
        "string"
        ? body.journeyId.trim()
        : "";

    const capturedDateValue =
      typeof body.capturedDate ===
        "string"
        ? body.capturedDate.trim()
        : "";

    /*
     * ----------------------------------------------------------
     * ALT TEXT
     * ----------------------------------------------------------
     */

    if (!altText) {
      return NextResponse.json(
        {
          error:
            "Alt text is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (altText.length > MAX_ALT_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Alt text must be 250 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (caption.length > MAX_CAPTION_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Caption must be 1000 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (location.length > MAX_LOCATION_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Location must be 200 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      photographer.length >
      MAX_PHOTOGRAPHER_LENGTH
    ) {
      return NextResponse.json(
        {
          error:
            "Photographer name must be 200 characters or less.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * VALIDATE JOURNEY
     * ----------------------------------------------------------
     */

    let journeyId:
      | string
      | null = null;

    if (journeyIdValue) {
      const journey =
        await prisma.journey.findUnique({
          where: {
            id:
              journeyIdValue,
          },

          select: {
            id: true,
          },
        });

      if (!journey) {
        return NextResponse.json(
          {
            error:
              "Selected journey was not found.",
          },
          {
            status: 400,
          }
        );
      }

      journeyId =
        journey.id;
    }

    /*
     * ----------------------------------------------------------
     * CAPTURED DATE
     * ----------------------------------------------------------
     */

    let capturedDate:
      | Date
      | null = null;

    if (capturedDateValue) {
      const parsedDate =
        new Date(
          `${capturedDateValue}T00:00:00`
        );

      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {
        return NextResponse.json(
          {
            error:
              "Invalid captured date.",
          },
          {
            status: 400,
          }
        );
      }

      capturedDate =
        parsedDate;
    }

    /*
     * ----------------------------------------------------------
     * UPDATE DATABASE
     * ----------------------------------------------------------
     */

    const media =
      await prisma.mediaAsset.update({
        where: {
          id,
        },

        data: {
          altText,

          caption:
            caption || null,

          location:
            location || null,

          photographer:
            photographer ||
            "Aditya Valvi",

          capturedDate,

          journeyId,
        },

        include: {
          journey: {
            select: {
              id: true,
              title: true,
            },
          },

          blocks: {
            select: {
              id: true,
              type: true,

              journey: {
                select: {
                  id: true,
                  title: true,
                },
              },

              blog: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },

          encounter: {
            select: {
              id: true,
              title: true,

              journey: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
        },
      });

    /*
     * ----------------------------------------------------------
     * LOAD COVER REFERENCES
     * ----------------------------------------------------------
     */

    const [
      journeyCovers,
      blogCovers,
    ] =
      await Promise.all([
        prisma.journey.findMany({
          where: {
            coverImage:
              media.url,
          },

          select: {
            id: true,
            title: true,
          },
        }),

        prisma.blog.findMany({
          where: {
            coverImage:
              media.url,
          },

          select: {
            id: true,
            title: true,
          },
        }),
      ]);

    /*
     * ----------------------------------------------------------
     * BUILD USAGE
     * ----------------------------------------------------------
     */

    const usage: Array<{
      type:
      | "JOURNEY"
      | "JOURNEY_COVER"
      | "BLOG_COVER"
      | "CONTENT_BLOCK"
      | "ENCOUNTER";

      id: string;

      title?: string;

      blockType?: string;

      journeyId?: string;

      journeyTitle?: string;
    }> = [];

    /*
     * JOURNEY ASSIGNMENT
     */

    if (media.journey) {
      usage.push({
        type:
          "JOURNEY",

        id:
          media.journey.id,

        title:
          media.journey.title,
      });
    }

    /*
     * JOURNEY COVERS
     */

    for (
      const journey of journeyCovers
    ) {
      usage.push({
        type:
          "JOURNEY_COVER",

        id:
          journey.id,

        title:
          journey.title,
      });
    }

    /*
     * BLOG COVERS
     */

    for (
      const blog of blogCovers
    ) {
      usage.push({
        type:
          "BLOG_COVER",

        id:
          blog.id,

        title:
          blog.title,
      });
    }

    /*
     * CONTENT BLOCKS
     */

    for (
      const block of media.blocks
    ) {
      usage.push({
        type:
          "CONTENT_BLOCK",

        id:
          block.id,

        title:
          block.blog?.title,

        blockType:
          block.type,

        journeyId:
          block.journey?.id,

        journeyTitle:
          block.journey?.title,
      });
    }

    /*
     * ENCOUNTER
     */

    if (media.encounter) {
      usage.push({
        type:
          "ENCOUNTER",

        id:
          media.encounter.id,

        title:
          media.encounter.title,

        journeyId:
          media.encounter
            .journey?.id,

        journeyTitle:
          media.encounter
            .journey?.title,
      });
    }

    /*
     * ----------------------------------------------------------
     * RETURN UPDATED MEDIA
     * ----------------------------------------------------------
     */

    return NextResponse.json({
      ...media,

      usage,

      usageCount:
        usage.length,

      isUsed:
        usage.length > 0,
    });
  } catch (error) {
    console.error(
      "PATCH media error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update media.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
 * ============================================================
 * DELETE — DELETE MEDIA
 * ============================================================
 */

export async function DELETE(
  request: Request
) {
  try {
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

    /*
     * ----------------------------------------------------------
     * READ MEDIA ID
     * ----------------------------------------------------------
     */

    const body =
      await request.json();

    const id =
      typeof body.id ===
        "string"
        ? body.id.trim()
        : "";

    if (!id) {
      return NextResponse.json(
        {
          error:
            "Media ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * FIND MEDIA
     * ----------------------------------------------------------
     */

    const media =
      await prisma.mediaAsset.findUnique({
        where: {
          id,
        },

        select: {
          id: true,
          url: true,
          fileName: true,
        },
      });

    if (!media) {
      return NextResponse.json(
        {
          error:
            "Media not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * CHECK CONTENT BLOCK
     * ----------------------------------------------------------
     */

    const contentBlock =
      await prisma.contentBlock.findFirst({
        where: {
          mediaId: id,
        },

        select: {
          id: true,
          type: true,
        },
      });

    if (contentBlock) {
      return NextResponse.json(
        {
          error:
            "This image is currently used in story content and cannot be deleted. Remove it from the content first.",

          code:
            "MEDIA_IN_USE",

          usage: {
            type:
              "CONTENT_BLOCK",

            blockId:
              contentBlock.id,

            blockType:
              contentBlock.type,
          },
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * CHECK ENCOUNTER
     * ----------------------------------------------------------
     */

    const encounter =
      await prisma.encounter.findFirst({
        where: {
          mediaId: id,
        },

        select: {
          id: true,
          title: true,
        },
      });

    if (encounter) {
      return NextResponse.json(
        {
          error:
            "This image is currently used by an encounter and cannot be deleted. Remove it from the encounter first.",

          code:
            "MEDIA_IN_USE",

          usage: {
            type:
              "ENCOUNTER",

            encounterId:
              encounter.id,

            title:
              encounter.title,
          },
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * CHECK JOURNEY COVER
     * ----------------------------------------------------------
     */

    const journey =
      await prisma.journey.findFirst({
        where: {
          coverImage:
            media.url,
        },

        select: {
          id: true,
          title: true,
        },
      });

    if (journey) {
      return NextResponse.json(
        {
          error:
            "This image is currently used as a journey cover image and cannot be deleted. Change or remove the journey cover image first.",

          code:
            "MEDIA_IN_USE",

          usage: {
            type:
              "JOURNEY_COVER",

            journeyId:
              journey.id,

            title:
              journey.title,
          },
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * CHECK BLOG COVER
     * ----------------------------------------------------------
     */

    const blog =
      await prisma.blog.findFirst({
        where: {
          coverImage:
            media.url,
        },

        select: {
          id: true,
          title: true,
        },
      });

    if (blog) {
      return NextResponse.json(
        {
          error:
            "This image is currently used as a blog cover image and cannot be deleted. Change or remove the blog cover image first.",

          code:
            "MEDIA_IN_USE",

          usage: {
            type:
              "BLOG_COVER",

            blogId:
              blog.id,

            title:
              blog.title,
          },
        },
        {
          status: 409,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * DELETE FROM VERCEL BLOB
     * ----------------------------------------------------------
     */

    try {
      await del(
        media.url
      );
    } catch (
    blobError
    ) {
      console.error(
        "Blob delete error:",
        blobError
      );

      return NextResponse.json(
        {
          error:
            "The image could not be removed from storage. The media record was kept.",
        },
        {
          status: 500,
        }
      );
    }

    /*
     * ----------------------------------------------------------
     * DELETE DATABASE RECORD
     * ----------------------------------------------------------
     */

    await prisma.mediaAsset.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,

      message:
        "Media deleted successfully.",
    });
  } catch (error) {
    console.error(
      "DELETE media error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete media.",
      },
      {
        status: 500,
      }
    );
  }
}