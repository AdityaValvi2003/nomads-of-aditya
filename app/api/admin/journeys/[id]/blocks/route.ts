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

/*
|--------------------------------------------------------------------------
| GET
|--------------------------------------------------------------------------
| Get all content blocks for a journey.
*/
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

    const blocks = await prisma.contentBlock.findMany({
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
        error: "Failed to load content blocks.",
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
| Create a new content block.
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

    const type =
      typeof body.type === "string"
        ? body.type
        : "";

    const data =
      body.data &&
      typeof body.data === "object"
        ? body.data
        : {};

    const imageDisplay =
      typeof body.imageDisplay === "string"
        ? body.imageDisplay
        : null;

    const mediaId =
      typeof body.mediaId === "string"
        ? body.mediaId
        : null;

    if (!type) {
      return NextResponse.json(
        {
          error: "Block type is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Check journey
    |--------------------------------------------------------------------------
    */

    const journey =
      await prisma.journey.findUnique({
        where: {
          id,
        },
      });

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
    | Validate media
    |--------------------------------------------------------------------------
    */

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
            error: "Selected media was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Calculate position
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

    /*
    |--------------------------------------------------------------------------
    | Create block
    |--------------------------------------------------------------------------
    */

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

    return NextResponse.json(block, {
      status: 201,
    });
  } catch (error) {
    console.error(
      "POST journey block error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to create content block.",
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
| Handles:
|
| 1. Normal content block update
| 2. Media selection/removal
| 3. Block reordering
|--------------------------------------------------------------------------
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

    /*
    |--------------------------------------------------------------------------
    | REORDER BLOCKS
    |--------------------------------------------------------------------------
    */

    if (body.reorder === true) {
      const rawBlocks: unknown = body.blocks;

      if (!Array.isArray(rawBlocks)) {
        return NextResponse.json(
          {
            error: "Blocks array is required for reordering.",
          },
          {
            status: 400,
          }
        );
      }

      const reorderItems: ReorderItem[] =
        rawBlocks
          .filter(
            (item: unknown): item is Record<
              string,
              unknown
            > =>
              typeof item === "object" &&
              item !== null
          )
          .map(
            (
              item: Record<string, unknown>
            ): ReorderItem => ({
              id:
                typeof item.id === "string"
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
            (
              item: ReorderItem
            ) =>
              item.id !== "" &&
              item.position >= 0
          );

      if (reorderItems.length === 0) {
        return NextResponse.json(
          {
            error: "No valid blocks supplied for reordering.",
          },
          {
            status: 400,
          }
        );
      }

      /*
      |--------------------------------------------------------------------------
      | Make sure all blocks belong to this journey
      |--------------------------------------------------------------------------
      */

      const blockIds: string[] =
        reorderItems.map(
          (
            item: ReorderItem
          ) => item.id
        );

      const existingBlocks =
        await prisma.contentBlock.findMany({
          where: {
            id: {
              in: blockIds,
            },
            journeyId: id,
          },
          select: {
            id: true,
          },
        });

      const existingBlockIds =
        new Set<string>(
          existingBlocks.map(
            (block) => block.id
          )
        );

      const invalidBlock =
        reorderItems.find(
          (
            item: ReorderItem
          ) =>
            !existingBlockIds.has(
              item.id
            )
        );

      if (invalidBlock) {
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

      /*
      |--------------------------------------------------------------------------
      | Save order in a transaction
      |--------------------------------------------------------------------------
      |
      | First give every block a temporary negative
      | position. This prevents collisions if position
      | has a unique constraint.
      |
      */

      await prisma.$transaction(
        async (transaction) => {
          await Promise.all(
            reorderItems.map(
              (
                item: ReorderItem,
                index: number
              ) =>
                transaction.contentBlock.update(
                  {
                    where: {
                      id: item.id,
                    },
                    data: {
                      position:
                        -(index + 1),
                    },
                  }
                )
            )
          );

          await Promise.all(
            reorderItems.map(
              (
                item: ReorderItem
              ) =>
                transaction.contentBlock.update(
                  {
                    where: {
                      id: item.id,
                    },
                    data: {
                      position:
                        item.position,
                    },
                  }
                )
            )
          );
        }
      );

      /*
      |--------------------------------------------------------------------------
      | Return updated blocks
      |--------------------------------------------------------------------------
      */

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
    | NORMAL BLOCK UPDATE
    |--------------------------------------------------------------------------
    */

    const blockId =
      typeof body.blockId === "string"
        ? body.blockId
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
          error: "Block ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find block
    |--------------------------------------------------------------------------
    */

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
          error: "Content block not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Validate selected media
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
            error: "Selected media was not found.",
          },
          {
            status: 404,
          }
        );
      }
    }

    /*
    |--------------------------------------------------------------------------
    | Update block
    |--------------------------------------------------------------------------
    */

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
    });
  } catch (error) {
    console.error(
      "PUT journey block error:",
      error
    );

    return NextResponse.json(
      {
        error: "Failed to update content block.",
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
| Delete a content block and normalize positions.
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
        ? body.blockId
        : "";

    if (!blockId) {
      return NextResponse.json(
        {
          error: "Block ID is required.",
        },
        {
          status: 400,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Find block
    |--------------------------------------------------------------------------
    */

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
          error: "Content block not found.",
        },
        {
          status: 404,
        }
      );
    }

    /*
    |--------------------------------------------------------------------------
    | Delete and normalize positions
    |--------------------------------------------------------------------------
    */

    await prisma.$transaction(
      async (transaction) => {
        await transaction.contentBlock.delete({
          where: {
            id: blockId,
          },
        });

        const remainingBlocks =
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
        |--------------------------------------------------------------
        | Temporary positions
        |--------------------------------------------------------------
        */

        await Promise.all(
          remainingBlocks.map(
            (
              remainingBlock: {
                id: string;
              },
              index: number
            ) =>
              transaction.contentBlock.update(
                {
                  where: {
                    id: remainingBlock.id,
                  },
                  data: {
                    position:
                      -(index + 1),
                  },
                }
              )
          )
        );

        /*
        |--------------------------------------------------------------
        | Normalize positions to 0,1,2,3...
        |--------------------------------------------------------------
        */

        await Promise.all(
          remainingBlocks.map(
            (
              remainingBlock: {
                id: string;
              },
              index: number
            ) =>
              transaction.contentBlock.update(
                {
                  where: {
                    id: remainingBlock.id,
                  },
                  data: {
                    position: index,
                  },
                }
              )
          )
        );
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
        error: "Failed to delete content block.",
      },
      {
        status: 500,
      }
    );
  }
}