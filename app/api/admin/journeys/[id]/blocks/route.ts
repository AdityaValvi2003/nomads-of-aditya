import { NextResponse } from "next/server";
import { getSession } from "../../../../../../src/lib/auth";
import { prisma } from "../../../../../../src/lib/prisma";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

type ReorderItem = {
  id: string;
  position: number;
};

const VALID_BLOCK_TYPES = [
  "HEADING",
  "SUBHEADING",
  "PARAGRAPH",
  "IMAGE",
  "IMAGE_TEXT",
  "GALLERY",
  "QUOTE",
  "VIDEO",
  "LOCATION",
  "JOURNEY_INFO",
  "ENCOUNTER",
  "DIVIDER",
] as const;

const VALID_IMAGE_DISPLAYS = [
  "AUTO",
  "STANDARD",
  "WIDE",
  "FULLSCREEN",
  "SPLIT",
] as const;

async function getJourney(id: string) {
  return prisma.journey.findUnique({
    where: {
      id,
    },
  });
}

export async function GET(
  _request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const blocks =
      await prisma.contentBlock.findMany({
        where: {
          journeyId: id,
        },
        orderBy: {
          position: "asc",
        },
        include: {
          media: true,
        },
      });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error(
      "GET journey blocks error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to load content blocks.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| POST
|--------------------------------------------------------------------------
| Create a normal block OR duplicate an existing block.
*/
export async function POST(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const journey =
      await getJourney(id);

    if (!journey) {
      return NextResponse.json(
        {
          error: "Journey not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | DUPLICATE
    |--------------------------------------------------------------------------
    */

    if (
      typeof body.duplicateOfBlockId ===
        "string" &&
      body.duplicateOfBlockId.trim() !== ""
    ) {
      const sourceBlockId =
        body.duplicateOfBlockId.trim();

      const sourceBlock =
        await prisma.contentBlock.findFirst({
          where: {
            id: sourceBlockId,
            journeyId: id,
          },
          include: {
            media: true,
          },
        });

      if (!sourceBlock) {
        return NextResponse.json(
          {
            error:
              "Block to duplicate was not found.",
          },
          {
            status: 404,
          }
        );
      }

      const duplicatedBlock =
        await prisma.$transaction(
          async (transaction) => {
            const journeyBlocks =
              await transaction.contentBlock.findMany({
                where: {
                  journeyId: id,
                },
                orderBy: {
                  position: "asc",
                },
              });

            const sourceIndex =
              journeyBlocks.findIndex(
                (block) =>
                  block.id ===
                  sourceBlockId
              );

            if (sourceIndex === -1) {
              throw new Error(
                "Source block not found."
              );
            }

            /*
            |--------------------------------------------------------------------------
            | Temporarily move all positions negative.
            |--------------------------------------------------------------------------
            */

            for (
              let index = 0;
              index <
              journeyBlocks.length;
              index++
            ) {
              await transaction.contentBlock.update({
                where: {
                  id:
                    journeyBlocks[
                      index
                    ].id,
                },
                data: {
                  position:
                    -(index + 1),
                },
              });
            }

            /*
            |--------------------------------------------------------------------------
            | Create duplicate.
            |--------------------------------------------------------------------------
            */

            const created =
              await transaction.contentBlock.create({
                data: {
                  type: sourceBlock.type,
                  position: 0,
                  data:
                    sourceBlock.data as any,
                  imageDisplay:
                    sourceBlock.imageDisplay,

                  journey: {
                    connect: {
                      id,
                    },
                  },

                  ...(sourceBlock.mediaId
                    ? {
                        media: {
                          connect: {
                            id: sourceBlock.mediaId,
                          },
                        },
                      }
                    : {}),
                },
              });

            /*
            |--------------------------------------------------------------------------
            | Insert duplicate immediately after source.
            |--------------------------------------------------------------------------
            */

            const orderedIds: string[] =
              [];

            for (
              let index = 0;
              index <
              journeyBlocks.length;
              index++
            ) {
              orderedIds.push(
                journeyBlocks[index].id
              );

              if (
                index === sourceIndex
              ) {
                orderedIds.push(
                  created.id
                );
              }
            }

            /*
            |--------------------------------------------------------------------------
            | Normalize final positions.
            |--------------------------------------------------------------------------
            */

            for (
              let index = 0;
              index <
              orderedIds.length;
              index++
            ) {
              await transaction.contentBlock.update({
                where: {
                  id:
                    orderedIds[
                      index
                    ],
                },
                data: {
                  position: index,
                },
              });
            }

            return created;
          }
        );

      const result =
        await prisma.contentBlock.findUnique({
          where: {
            id: duplicatedBlock.id,
          },
          include: {
            media: true,
          },
        });

      return NextResponse.json(
        result,
        {
          status: 201,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | NORMAL CREATE
    |--------------------------------------------------------------------------
    */

    const type =
      typeof body.type === "string"
        ? body.type.trim()
        : "";

    const data =
      body.data &&
      typeof body.data === "object"
        ? body.data
        : {};

    const imageDisplay =
      typeof body.imageDisplay ===
      "string"
        ? body.imageDisplay
        : null;

    const mediaId =
      typeof body.mediaId === "string"
        ? body.mediaId
        : null;

    if (!type) {
      return NextResponse.json(
        {
          error:
            "Block type is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (
  !VALID_BLOCK_TYPES.includes(
    type as (typeof VALID_BLOCK_TYPES)[number]
  )
) {
  return NextResponse.json(
    {
      error:
        "Invalid content block type.",
    },
    {
      status: 400,
    }
  );
}

if (
  imageDisplay !== null &&
  !VALID_IMAGE_DISPLAYS.includes(
    imageDisplay as (typeof VALID_IMAGE_DISPLAYS)[number]
  )
) {
  return NextResponse.json(
    {
      error:
        "Invalid image display mode.",
    },
    {
      status: 400,
    }
  );
}

    if (mediaId) {
      const media =
        await prisma.mediaAsset.findUnique({
          where: {
            id: mediaId,
          },
        });

      if (!media) {
        return NextResponse.json(
          {
            error:
              "Selected media was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate next position.
    |--------------------------------------------------------------------------
    */

    const lastBlock =
      await prisma.contentBlock.findFirst({
        where: {
          journeyId: id,
        },
        orderBy: {
          position: "desc",
        },
      });

    const position = lastBlock
      ? lastBlock.position + 1
      : 0;

    const block =
      await prisma.contentBlock.create({
        data: {
          type,
          position,
          data,
          imageDisplay,

          journey: {
            connect: {
              id,
            },
          },

          ...(mediaId
            ? {
                media: {
                  connect: {
                    id: mediaId,
                  },
                },
              }
            : {}),
        },

        include: {
          media: true,
        },
      });

    return NextResponse.json(
      block,
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error(
      "POST journey block error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to create content block.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| PUT
|--------------------------------------------------------------------------
| Normal update OR reorder.
*/
export async function PUT(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const journey =
      await getJourney(id);

    if (!journey) {
      return NextResponse.json(
        {
          error: "Journey not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | REORDER
    |--------------------------------------------------------------------------
    */

    if (body.reorder === true) {
      const rawBlocks: unknown =
        body.blocks;

      if (!Array.isArray(rawBlocks)) {
        return NextResponse.json(
          {
            error:
              "Blocks array is required for reordering.",
          },
          {
            status: 400,
          }
        );
      }

      const reorderItems: ReorderItem[] =
        rawBlocks
          .filter(
            (
              item: unknown
            ): item is Record<
              string,
              unknown
            > =>
              typeof item === "object" &&
              item !== null
          )
          .map(
            (
              item: Record<
                string,
                unknown
              >
            ) => ({
              id:
                typeof item.id ===
                "string"
                  ? item.id
                  : "",
              position:
                typeof item.position ===
                "number"
                  ? item.position
                  : -1,
            })
          )
          .filter(
            (item) =>
              item.id !== "" &&
              Number.isInteger(
                item.position
              ) &&
              item.position >= 0
          );

      if (reorderItems.length === 0) {
        return NextResponse.json(
          {
            error:
              "No valid blocks supplied for reordering.",
          },
          {
            status: 400,
          }
        );
      }

      const existingBlocks =
        await prisma.contentBlock.findMany({
          where: {
            journeyId: id,
          },
          select: {
            id: true,
          },
        });

      const existingIds =
        new Set(
          existingBlocks.map(
            (block) => block.id
          )
        );

      const suppliedIds =
        new Set(
          reorderItems.map(
            (item) => item.id
          )
        );

      /*
      |--------------------------------------------------------------------------
      | Prevent duplicate IDs.
      |--------------------------------------------------------------------------
      */

      if (
        suppliedIds.size !==
        reorderItems.length
      ) {
        return NextResponse.json(
          {
            error:
              "Duplicate block IDs were supplied.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Every block must be included.
      |--------------------------------------------------------------------------
      */

      if (
        suppliedIds.size !==
        existingIds.size
      ) {
        return NextResponse.json(
          {
            error:
              "The complete block list is required for reordering.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | All IDs must belong to this journey.
      |--------------------------------------------------------------------------
      */

      for (const item of reorderItems) {
        if (
          !existingIds.has(
            item.id
          )
        ) {
          return NextResponse.json(
            {
              error:
                "One or more blocks do not belong to this journey.",
            },
            {
              status: 400,
            }
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Positions must be unique and contiguous.
      |--------------------------------------------------------------------------
      */

      const positions =
        reorderItems.map(
          (item) =>
            item.position
        );

      const uniquePositions =
        new Set(positions);

      if (
        uniquePositions.size !==
        positions.length
      ) {
        return NextResponse.json(
          {
            error:
              "Block positions must be unique.",
          },
          {
            status: 400,
          }
        );
      }

      const ordered =
        [...reorderItems].sort(
          (a, b) =>
            a.position -
            b.position
        );

      for (
        let index = 0;
        index < ordered.length;
        index++
      ) {
        if (
          ordered[index]
            .position !== index
        ) {
          return NextResponse.json(
            {
              error:
                "Block positions must start at 0 and be contiguous.",
            },
            {
              status: 400,
            }
          );
        }
      }

      /*
      |--------------------------------------------------------------------------
      | Transaction
      |--------------------------------------------------------------------------
      */

      await prisma.$transaction(
        async (transaction) => {
          /*
          |--------------------------------------------------------------------------
          | Temporary negative positions.
          |--------------------------------------------------------------------------
          */

          for (
            let index = 0;
            index < ordered.length;
            index++
          ) {
            await transaction.contentBlock.update({
              where: {
                id:
                  ordered[index].id,
              },
              data: {
                position:
                  -(index + 1),
              },
            });
          }

          /*
          |--------------------------------------------------------------------------
          | Final positions.
          |--------------------------------------------------------------------------
          */

          for (
            let index = 0;
            index < ordered.length;
            index++
          ) {
            await transaction.contentBlock.update({
              where: {
                id:
                  ordered[index].id,
              },
              data: {
                position: index,
              },
            });
          }
        }
      );

      const updatedBlocks =
        await prisma.contentBlock.findMany({
          where: {
            journeyId: id,
          },
          orderBy: {
            position: "asc",
          },
          include: {
            media: true,
          },
        });

      return NextResponse.json({
        success: true,
        blocks: updatedBlocks,
      });
    }

    /*
    |--------------------------------------------------------------------------
    | NORMAL UPDATE
    |--------------------------------------------------------------------------
    */

    const blockId =
      typeof body.blockId === "string"
        ? body.blockId.trim()
        : "";

    const data =
      body.data &&
      typeof body.data === "object"
        ? body.data
        : {};

    const hasMediaId =
      Object.prototype.hasOwnProperty.call(
        body,
        "mediaId"
      );

    const mediaId =
      typeof body.mediaId === "string"
        ? body.mediaId
        : null;

    if (!blockId) {
      return NextResponse.json(
        {
          error:
            "Block ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const block =
      await prisma.contentBlock.findFirst({
        where: {
          id: blockId,
          journeyId: id,
        },
      });

    if (!block) {
      return NextResponse.json(
        {
          error:
            "Content block not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate media ownership/existence.
    |--------------------------------------------------------------------------
    */

    if (hasMediaId && mediaId) {
      const media =
        await prisma.mediaAsset.findUnique({
          where: {
            id: mediaId,
          },
        });

      if (!media) {
        return NextResponse.json(
          {
            error:
              "Selected media was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    const updatedBlock =
      await prisma.contentBlock.update({
        where: {
          id: blockId,
        },

        data: {
          data,

          ...(hasMediaId
            ? {
                media: mediaId
                  ? {
                      connect: {
                        id: mediaId,
                      },
                    }
                  : {
                      disconnect: true,
                    },
              }
            : {}),
        },

        include: {
          media: true,
        },
      });

    return NextResponse.json({
      success: true,
      data: updatedBlock.data,
      media: updatedBlock.media,
      mediaId:
        updatedBlock.media?.id ??
        null,
    });
  } catch (error) {
    console.error(
      "PUT journey block error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update content block.",
      },
      {
        status: 500,
      }
    );
  }
}

/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/
export async function DELETE(
  request: Request,
  { params }: RouteContext
) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const body = await request.json();

    const blockId =
      typeof body.blockId === "string"
        ? body.blockId.trim()
        : "";

    if (!blockId) {
      return NextResponse.json(
        {
          error:
            "Block ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    const block =
      await prisma.contentBlock.findFirst({
        where: {
          id: blockId,
          journeyId: id,
        },
      });

    if (!block) {
      return NextResponse.json(
        {
          error:
            "Content block not found.",
        },
        {
          status: 404,
        }
      );
    }

    await prisma.$transaction(
      async (transaction) => {
        await transaction.contentBlock.delete({
          where: {
            id: blockId,
          },
        });

        const remaining =
          await transaction.contentBlock.findMany({
            where: {
              journeyId: id,
            },
            orderBy: {
              position: "asc",
            },
            select: {
              id: true,
            },
          });

        /*
        |--------------------------------------------------------------------------
        | Temporary negative positions.
        |--------------------------------------------------------------------------
        */

        for (
          let index = 0;
          index < remaining.length;
          index++
        ) {
          await transaction.contentBlock.update({
            where: {
              id:
                remaining[index].id,
            },
            data: {
              position:
                -(index + 1),
            },
          });
        }

        /*
        |--------------------------------------------------------------------------
        | Normalize positions.
        |--------------------------------------------------------------------------
        */

        for (
          let index = 0;
          index < remaining.length;
          index++
        ) {
          await transaction.contentBlock.update({
            where: {
              id:
                remaining[index].id,
            },
            data: {
              position: index,
            },
          });
        }
      }
    );

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(
      "DELETE journey block error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to delete content block.",
      },
      {
        status: 500,
      }
    );
  }
}