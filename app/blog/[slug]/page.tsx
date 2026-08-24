import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "../../../src/lib/prisma";
import { ContentStatus } from "../../../src/generated/prisma/enums";

export const dynamic = "force-dynamic";

type BlogPostPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function calculateReadingTime(content: string) {
  const words = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

/*
 * ============================================================
 * INLINE TEXT
 * ============================================================
 */

function renderInlineText(text: string) {
  const parts = text.split(/(\*\*.*?\*\*)/g);

  return parts.map((part, index) => {
    if (
      part.startsWith("**") &&
      part.endsWith("**") &&
      part.length >= 4
    ) {
      return (
        <strong key={index}>
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={index}>{part}</span>;
  });
}

/*
 * ============================================================
 * STORY CONTENT
 * ============================================================
 */

function StoryContent({
  content,
}: {
  content: string;
}) {
  const lines = content.split("\n");

  const elements: React.ReactNode[] = [];

  let paragraphLines: string[] = [];

  function flushParagraph() {
    if (paragraphLines.length === 0) {
      return;
    }

    const text = paragraphLines.join(" ").trim();

    if (text) {
      elements.push(
        <p
          key={`paragraph-${elements.length}`}
          className="story-paragraph"
        >
          {renderInlineText(text)}
        </p>
      );
    }

    paragraphLines = [];
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim();

    /*
     * EMPTY LINE
     */

    if (!line) {
      flushParagraph();
      return;
    }

    /*
     * IMAGE
     *
     * [IMAGE:https://example.com/photo.jpg]
     */

    const imageMatch = line.match(
      /^\[IMAGE:(.+)\]$/
    );

    if (imageMatch) {
      flushParagraph();

      const imageUrl = imageMatch[1].trim();

      elements.push(
        <figure
          key={`image-${index}`}
          className="story-image"
        >
          <img
            src={imageUrl}
            alt="Story image"
            loading="lazy"
          />
        </figure>
      );

      return;
    }

    /*
     * H1
     */

    if (line.startsWith("# ")) {
      flushParagraph();

      elements.push(
        <h2
          key={`h1-${index}`}
          className="story-h1"
        >
          {renderInlineText(line.slice(2))}
        </h2>
      );

      return;
    }

    /*
     * H2
     */

    if (line.startsWith("## ")) {
      flushParagraph();

      elements.push(
        <h3
          key={`h2-${index}`}
          className="story-h2"
        >
          {renderInlineText(line.slice(3))}
        </h3>
      );

      return;
    }

    /*
     * QUOTE
     */

    if (line.startsWith("> ")) {
      flushParagraph();

      elements.push(
        <blockquote
          key={`quote-${index}`}
          className="story-quote"
        >
          {renderInlineText(line.slice(2))}
        </blockquote>
      );

      return;
    }

    /*
     * DIVIDER
     */

    if (line === "---" || line === "***") {
      flushParagraph();

      elements.push(
        <hr
          key={`divider-${index}`}
          className="story-divider"
        />
      );

      return;
    }

    /*
     * NORMAL TEXT
     */

    paragraphLines.push(line);
  });

  flushParagraph();

  return (
    <div className="story-content">
      {elements}
    </div>
  );
}

/*
 * ============================================================
 * PAGE
 * ============================================================
 */

export default async function BlogPostPage({
  params,
}: BlogPostPageProps) {
  const { slug } = await params;

  /*
   * ==========================================================
   * LOAD PUBLISHED BLOG
   * ==========================================================
   */

  const blog = await prisma.blog.findFirst({
    where: {
      slug,
      status: ContentStatus.PUBLISHED,
    },

    include: {
      author: {
        select: {
          id: true,
          name: true,
        },
      },

      contentBlocks: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!blog) {
    notFound();
  }

  /*
   * ==========================================================
   * CONTENT
   * ==========================================================
   */

  const content = blog.contentBlocks
    .map((block) => {
      const data = block.data as {
        text?: string;
      };

      return data?.text || "";
    })
    .join("\n\n");

  /*
   * ==========================================================
   * READING TIME
   * ==========================================================
   */

  const readingTime = calculateReadingTime(content);

  /*
   * ==========================================================
   * DATE
   * ==========================================================
   */

  const formattedDate = (
    blog.publishedAt || blog.createdAt
  ).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  /*
   * ==========================================================
   * PAGE
   * ==========================================================
   */

  return (
    <>
      <style>{`

        .story-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        /* =====================================================
           HEADER
        ===================================================== */

        .story-header {
          max-width: 1000px;
          margin: 0 auto;
          text-align: center;
        }

        .story-category {
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .15em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .story-title {
          font:
            clamp(3.5rem, 8vw, 8rem)
            / .9
            var(--serif);

          margin: 20px 0 30px;
        }

        .story-excerpt {
          max-width: 750px;
          margin: 0 auto;

          color: var(--muted);

          font-size: 1.1rem;
          line-height: 1.8;
        }

        /* =====================================================
           META
        ===================================================== */

        .story-meta {
          display: flex;
          justify-content: center;
          align-items: center;

          flex-wrap: wrap;
          gap: 12px;

          margin-top: 30px;

          color: var(--muted);

          font-size: .7rem;
          letter-spacing: .06em;
          text-transform: uppercase;
        }

        /* =====================================================
           COVER IMAGE
        ===================================================== */

        .story-cover {
          max-width: 1200px;

          margin:
            70px auto
            80px;

          overflow: hidden;

          border: 1px solid var(--line);

          background: var(--panel);
        }

        .story-cover img {
          display: block;

          width: 100%;

          max-height: 700px;

          object-fit: cover;
        }

        /* =====================================================
           CONTENT
        ===================================================== */

        .story-content-wrapper {
          max-width: 800px;
          margin: 0 auto;
        }

        .story-content {
          color: #d8d2c8;

          font-size: 1.08rem;

          line-height: 1.95;
        }

        .story-paragraph {
          margin:
            0 0 30px;
        }

        /* =====================================================
           HEADINGS
        ===================================================== */

        .story-h1 {
          font:
            clamp(2rem, 4vw, 3.4rem)
            / 1.1
            var(--serif);

          color: var(--text);

          margin:
            60px 0 25px;
        }

        .story-h2 {
          font:
            clamp(1.5rem, 3vw, 2.4rem)
            / 1.2
            var(--serif);

          color: var(--text);

          margin:
            50px 0 20px;
        }

        .story-content strong {
          color: var(--text);
          font-weight: 700;
        }

        /* =====================================================
           QUOTE
        ===================================================== */

        .story-quote {
          margin:
            45px 0;

          padding:
            25px 30px;

          border-left:
            3px solid var(--accent);

          color: var(--text);

          font:
            1.35rem / 1.6
            var(--serif);

          font-style: italic;
        }

        /* =====================================================
           DIVIDER
        ===================================================== */

        .story-divider {
          border: 0;

          border-top:
            1px solid var(--line);

          margin:
            55px 0;
        }

        /* =====================================================
           INLINE STORY IMAGE
        ===================================================== */

        .story-image {
          margin:
            55px
            0;

          width: 100%;
        }

        .story-image img {
          display: block;

          width: 100%;

          max-height: 750px;

          object-fit: cover;
        }

        /* =====================================================
           FOOTER
        ===================================================== */

        .story-footer {
          max-width: 800px;

          margin:
            80px auto 0;

          padding-top:
            35px;

          border-top:
            1px solid var(--line);
        }

        .back-link {
          display: inline-block;

          color: var(--accent);

          font-size: .68rem;

          letter-spacing: .1em;

          text-transform: uppercase;
        }

        .back-link:hover {
          color: var(--accent2);
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 700px) {

          .story-page {
            padding:
              110px
              7vw
              70px;
          }

          .story-title {
            font-size: 3.5rem;
          }

          .story-cover {
            margin:
              50px auto
              55px;
          }

          .story-content {
            font-size: 1rem;
          }

          .story-quote {
            padding: 20px;
          }

          .story-image {
            margin:
              40px 0;
          }

        }

      `}</style>

      <main className="story-page">

        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="story-header">

          <span className="story-category">
            {blog.subtitle || "Travel"}
          </span>

          <h1 className="story-title">
            {blog.title}
          </h1>

          {blog.shortIntro && (
            <p className="story-excerpt">
              {blog.shortIntro}
            </p>
          )}

          <div className="story-meta">

            <span>
              {blog.author?.name || "Aditya"}
            </span>

            <span>·</span>

            <span>
              {formattedDate}
            </span>

            <span>·</span>

            <span>
              {readingTime} min read
            </span>

          </div>

        </header>

        {/* ==================================================
            COVER IMAGE
        ================================================== */}

        {blog.coverImage && (
          <div className="story-cover">

            <img
              src={blog.coverImage}
              alt={blog.title}
              fetchPriority="high"
            />

          </div>
        )}

        {/* ==================================================
            CONTENT
        ================================================== */}

        <article className="story-content-wrapper">

          {content ? (
            <StoryContent content={content} />
          ) : (
            <div className="story-content">

              <p className="story-paragraph">
                This story has no content yet.
              </p>

            </div>
          )}

        </article>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="story-footer">

          <Link
            href="/blog"
            className="back-link"
          >
            ← Back to all stories
          </Link>

        </footer>

      </main>
    </>
  );
}