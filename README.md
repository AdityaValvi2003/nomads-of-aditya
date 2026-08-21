# Nomads of Aditya

A personal travel storytelling platform designed to document journeys, destinations, photographs, encounters, and travel experiences in a structured and immersive way.

The project is being built as a full-stack web application with an admin dashboard for managing journeys, content, and media.

---

## Project Overview

Nomads of Aditya is more than a simple travel blog.

The goal is to create a platform where every journey can be documented as a complete visual story.

A journey can contain:

- Journey information
- Story sections
- Headings
- Paragraphs
- Quotes
- Images
- Image + text sections
- Galleries
- Videos
- Locations
- Encounters
- Travel-related information

The application also includes a centralized Media Library so photographs can be uploaded once and reused across multiple journeys.

---

# Current Features

## Admin Dashboard

The admin dashboard provides a central place to manage the platform.

Current functionality includes:

- Journey management
- Journey content management
- Media Library
- Media upload
- Media preview
- Media deletion
- Media search
- Media filtering
- Reusable media selection inside content blocks

---

# Journey Management

Journeys are the main content entities of the platform.

Each journey can contain:

- Title
- Journey metadata
- Content blocks
- Media
- Locations
- Story information

The journey editor provides a structured way to build a complete travel story.

---

# Content Builder

The Content Builder allows journeys to be constructed using reusable content blocks.

Currently supported block types:

### Heading

Large section heading.

### Subheading

Smaller section heading.

### Paragraph

Normal story content.

### Quote

Quote block with:

- Quote text
- Author
- Preview

### Divider

Visual section separator.

### Image

Single photograph selected from the Media Library.

Supports:

- Image
- Alt text
- Caption
- Media Library selection

### Image + Text

Combines an image with accompanying story text.

Supports:

- Image
- Alt text
- Story text
- Media Library selection

### Gallery

Multiple photographs inside one content block.

Supports:

- Multiple images
- Image URLs
- Alt text
- Captions

### Video

Video content using a video URL.

Supports:

- Video URL
- Caption

### Location

Location information.

Supports:

- Location name
- Address
- Latitude
- Longitude

### Journey Info

Trip information.

Supports:

- Duration
- Distance
- Difficulty

### Encounter

A memorable person or experience from a journey.

Supports:

- Encounter title
- Story

---

# Media Library

The Media Library is the centralized image management system.

All uploaded photographs are stored in Vercel Blob and tracked in the database.

## Media Features

### Upload

Images can be uploaded directly from the admin Media Library.

Current restrictions:

- Images only
- Maximum file size: 10 MB

### Search

Media can be searched by:

- Filename
- Location
- Caption
- Alt text
- Journey title

### Filters

Media can be filtered by:

- All
- Journey
- Unassigned

### Preview

Clicking a photograph opens a detailed modal containing:

- Large image preview
- File name
- File type
- File size
- Dimensions
- Upload date
- Photographer
- Location
- Alt text
- Caption
- Journey

### Copy URL

The public media URL can be copied directly from the media preview.

### Delete

Deleting media removes:

1. The Vercel Blob file
2. The corresponding database record

---

# MediaPicker

The MediaPicker allows content blocks to reuse images from the centralized Media Library.

Instead of manually entering image URLs, an editor can select an existing photograph from the Media Library.

This is currently integrated with:

- Image blocks
- Image + Text blocks

---

# Technology Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS
- CSS

## Backend

- Next.js App Router
- Next.js API Routes
- TypeScript

## Database

- Prisma ORM
- PostgreSQL

## Storage

- Vercel Blob

## Authentication

- Custom session-based authentication

---

# Project Structure

```text
nomads-of-aditya/
│
├── app/
│   │
│   ├── admin/
│   │   ├── journeys/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       ├── ContentBuilder.tsx
│   │   │       └── editor/
│   │   │           └── MediaPicker.tsx
│   │   │
│   │   └── media/
│   │       └── page.tsx
│   │
│   ├── api/
│   │   └── admin/
│   │       ├── media/
│   │       │   └── route.ts
│   │       │
│   │       └── journeys/
│   │           └── [id]/
│   │               └── blocks/
│   │                   └── route.ts
│   │
│   └── ...
│
├── prisma/
│   └── schema.prisma
│
├── src/
│   └── lib/
│       ├── auth.ts
│       └── prisma.ts
│
├── public/
│
├── package.json
├── tsconfig.json
├── next.config.*
└── README.md