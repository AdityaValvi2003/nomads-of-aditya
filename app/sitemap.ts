import type { MetadataRoute } from "next";

import { prisma } from "../src/lib/prisma";

export const dynamic = "force-dynamic";

const baseUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://nomads-of-aditya.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [
    journeys,
    blogs,
    destinations,
    encounters,
  ] = await Promise.all([
    prisma.journey.findMany({
      where: {
        status: "PUBLISHED",
        noIndex: false,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.blog.findMany({
      where: {
        status: "PUBLISHED",
        noIndex: false,
      },
      select: {
        slug: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.dreamDestination.findMany({
      select: {
        id: true,
        updatedAt: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),

    prisma.encounter.findMany({
      where: {
        journey: {
          status: "PUBLISHED",
          noIndex: false,
        },
      },
      select: {
        id: true,
        updatedAt: true,
        journey: {
          select: {
            slug: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/journeys`,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/dream-destinations`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/contact`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const journeyPages: MetadataRoute.Sitemap =
    journeys.map((journey) => ({
      url: `${baseUrl}/journeys/${journey.slug}`,
      lastModified: journey.updatedAt,
      changeFrequency: "monthly",
      priority: 0.8,
    }));

  const blogPages: MetadataRoute.Sitemap =
    blogs.map((blog) => ({
      url: `${baseUrl}/blog/${blog.slug}`,
      lastModified: blog.updatedAt,
      changeFrequency: "monthly",
      priority: 0.7,
    }));

  const destinationPages: MetadataRoute.Sitemap =
    destinations.map((destination) => ({
      url: `${baseUrl}/dream-destinations/${destination.id}`,
      lastModified: destination.updatedAt,
      changeFrequency: "monthly",
      priority: 0.6,
    }));

  const encounterPages: MetadataRoute.Sitemap =
    encounters.map((encounter) => ({
      url: `${baseUrl}/journeys/${encounter.journey.slug}/encounters/${encounter.id}`,
      lastModified: encounter.updatedAt,
      changeFrequency: "monthly",
      priority: 0.5,
    }));

  return [
    ...staticPages,
    ...journeyPages,
    ...blogPages,
    ...destinationPages,
    ...encounterPages,
  ];
}