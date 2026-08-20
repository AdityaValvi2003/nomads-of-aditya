import { put, del } from "@vercel/blob";
import { NextResponse } from "next/server";
import { prisma } from "../../../../src/lib/prisma";
import { getSession } from "../../../../src/lib/auth";

export async function GET() {
    try {
        const session = await getSession();

        if (!session) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

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
                },
            });

        return NextResponse.json(media);
    } catch (error) {
        console.error(
            "GET media error:",
            error
        );

        return NextResponse.json(
            {
                error: "Failed to load media.",
            },
            {
                status: 500,
            }
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

        const formData =
            await request.formData();

        const file =
            formData.get("file");

        const altText =
            typeof formData.get("altText") ===
                "string"
                ? String(
                    formData.get("altText")
                ).trim()
                : "";

        const caption =
            typeof formData.get("caption") ===
                "string"
                ? String(
                    formData.get("caption")
                ).trim()
                : "";

        const location =
            typeof formData.get("location") ===
                "string"
                ? String(
                    formData.get("location")
                ).trim()
                : "";

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

        if (!file.type.startsWith("image/")) {
            return NextResponse.json(
                {
                    error:
                        "Only image files are allowed.",
                },
                {
                    status: 400,
                }
            );
        }

        if (file.size > 10 * 1024 * 1024) {
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

        const blob = await put(
            file.name,
            file,
            {
                access: "public",
            }
        );

        const media =
            await prisma.mediaAsset.create({
                data: {
                    url: blob.url,
                    fileName: blob.pathname,
                    mimeType: file.type,
                    fileSize: file.size,
                    altText:
                        altText || null,
                    caption:
                        caption || null,
                    location:
                        location || null,
                },
            });

        return NextResponse.json(
            media,
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

        const body =
            await request.json();

        const id =
            typeof body.id === "string"
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

        const media =
            await prisma.mediaAsset.findUnique({
                where: {
                    id,
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
         * Delete the actual file from
         * Vercel Blob first.
         */
        try {
            await del(media.url);
        } catch (blobError) {
            console.error(
                "Blob delete error:",
                blobError
            );
        }

        /*
         * Then delete the database
         * record.
         */
        await prisma.mediaAsset.delete({
            where: {
                id,
            },
        });

        return NextResponse.json({
            success: true,
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