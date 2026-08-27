import Link from "next/link";
import { prisma } from "../../src/lib/prisma";
import { ContentStatus } from "../../src/generated/prisma/enums";

export const dynamic = "force-dynamic";

function calculateReadingTime(content: string) {
  const words = content
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.ceil(words / 200));
}

export default async function BlogPage() {
  const blogs = await prisma.blog.findMany({
    where: {
      status: ContentStatus.PUBLISHED,
    },

    orderBy: {
      publishedAt: "desc",
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

  const posts = blogs.map((blog) => {
    const content = blog.contentBlocks
      .map((block) => {
        const data = block.data as {
          text?: string;
        };

        return data?.text || "";
      })
      .join("\n\n");

    return {
      id: blog.id,
      title: blog.title,
      slug: blog.slug,

      excerpt:
        blog.shortIntro ||
        blog.subtitle ||
        "A story from the road.",

      category:
        blog.subtitle ||
        "Travel",

      coverImage: blog.coverImage,

      featured: blog.isFeatured,

      author:
        blog.author?.name ||
        "Aditya",

      date:
        blog.publishedAt ||
        blog.createdAt,

      readingTime:
        calculateReadingTime(content),
    };
  });

  const featuredPost =
    posts.find((post) => post.featured) ||
    posts[0];

  const remainingPosts = featuredPost
    ? posts.filter(
      (post) =>
        post.id !== featuredPost.id
    )
    : [];

  return (
    <>
      <style>{`

        .blog-page {
          min-height: 100vh;
          padding: 150px 6vw 100px;
        }

        /* HEADER */

        .blog-header {
          max-width: 850px;
          margin-bottom: 70px;
        }

        .blog-header h1 {
          font:
            clamp(4rem, 9vw, 8rem)
            / .9
            var(--serif);

          margin: 15px 0 25px;
        }

        .blog-header p {
          max-width: 650px;
          color: var(--muted);
          font-size: 1.05rem;
          line-height: 1.8;
        }

        /* FEATURED */

        .featured-section {
          margin-bottom: 80px;
        }

        .section-label {
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .14em;
          text-transform: uppercase;
          font-weight: 700;
          margin-bottom: 18px;
        }

        .featured-card {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          min-height: 500px;
          border: 1px solid var(--line);
          background: var(--panel);
          overflow: hidden;
        }

        .featured-image {
          min-height: 500px;
          background: #111;
          overflow: hidden;
        }

        .featured-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .featured-placeholder {
  width: 100%;
  height: 100%;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background:
    linear-gradient(
      135deg,
      var(--panel),
      var(--bg)
    );
}

        .featured-content {
          padding: 55px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .post-category {
          color: var(--accent);
          font-size: .68rem;
          letter-spacing: .13em;
          text-transform: uppercase;
          font-weight: 700;
        }

        .featured-content h2 {
          font:
            clamp(2.5rem, 5vw, 5rem)
            / .95
            var(--serif);

          margin: 18px 0 25px;
        }

        .post-excerpt {
          color: var(--muted);
          line-height: 1.8;
          margin-bottom: 30px;
        }

        .post-meta {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
          color: var(--muted);
          font-size: .7rem;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .read-link {
          display: inline-block;
          width: fit-content;
          margin-top: 35px;
          padding: 13px 18px;
          border: 1px solid var(--accent);
          background: var(--accent);
          color: #15110b;
          font-size: .68rem;
          letter-spacing: .08em;
          text-transform: uppercase;
          transition: .2s;
        }

        .read-link:hover {
          background: var(--accent2);
          border-color: var(--accent2);
        }

        /* POSTS */

        .posts-section {
          border-top: 1px solid var(--line);
          padding-top: 45px;
        }

        .posts-grid {
          display: grid;
          grid-template-columns:
            repeat(2, minmax(0, 1fr));

          gap: 25px;
        }

        .post-card {
          border: 1px solid var(--line);
          background: var(--panel);
          overflow: hidden;
          transition: transform .2s,
            border-color .2s;
        }

        .post-card:hover {
          transform: translateY(-4px);
          border-color: var(--accent);
        }

        .post-image {
          aspect-ratio: 16 / 9;
          background: #111;
          overflow: hidden;
        }

        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
        }

        .post-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--muted);
  background:
    linear-gradient(
      135deg,
      var(--panel),
      var(--bg)
    );
}

        .post-body {
          padding: 28px;
        }

        .post-body h2 {
          font:
            clamp(1.8rem, 3vw, 2.7rem)
            / 1
            var(--serif);

          margin: 12px 0 15px;
        }

        .post-body .post-excerpt {
          margin-bottom: 22px;
        }

        .post-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 15px;
          padding-top: 20px;
          border-top: 1px solid var(--line);
        }

        .post-date {
          color: var(--muted);
          font-size: .68rem;
          text-transform: uppercase;
          letter-spacing: .05em;
        }

        .post-read {
          color: var(--accent);
          font-size: .68rem;
          text-transform: uppercase;
          letter-spacing: .08em;
        }

        /* EMPTY */

        .empty-state {
          border: 1px dashed var(--line);
          padding: 80px 30px;
          text-align: center;
        }

        .empty-state h2 {
          font:
            2.5rem
            var(--serif);

          margin-bottom: 10px;
        }

        .empty-state p {
          color: var(--muted);
        }

        /* MOBILE */

        @media (max-width: 900px) {

          .featured-card {
            grid-template-columns: 1fr;
          }

          .featured-image,
          .featured-placeholder {
            min-height: 350px;
          }

          .featured-content {
            padding: 35px;
          }

        }

        @media (max-width: 650px) {

          .blog-page {
            padding:
              110px
              7vw
              70px;
          }

          .blog-header {
            margin-bottom: 50px;
          }

          .posts-grid {
            grid-template-columns: 1fr;
          }

          .featured-content h2 {
            font-size: 3rem;
          }

        }

      `}</style>

      <main className="blog-page">

        {/* HEADER */}

        <header className="blog-header">

          <span className="eyebrow">
            NOMADS OF ADITYA · STORIES
          </span>

          <h1>
            Stories
          </h1>

          <p>
            Notes from the road, people
            I've met, places I've wandered,
            and things I've learned along
            the way.
          </p>

        </header>


        {/* NO POSTS */}

        {posts.length === 0 ? (

          <section className="empty-state">

            <h2>
              No stories yet.
            </h2>

            <p>
              The next story is waiting
              to be written.
            </p>

          </section>

        ) : (

          <>

            {/* FEATURED */}

            {featuredPost && (

              <section className="featured-section">

                <div className="section-label">
                  Featured Story
                </div>

                <article className="featured-card">

                  <div className="featured-image">

                    {featuredPost.coverImage ? (

                      <img
                        src={
                          featuredPost.coverImage
                        }
                        alt={
                          featuredPost.title
                        }
                      />

                    ) : (

                      <div className="featured-placeholder">
                        No cover image
                      </div>

                    )}

                  </div>


                  <div className="featured-content">

                    <span className="post-category">
                      {featuredPost.category}
                    </span>

                    <h2>
                      {featuredPost.title}
                    </h2>

                    <p className="post-excerpt">
                      {featuredPost.excerpt}
                    </p>

                    <div className="post-meta">

                      <span>
                        {featuredPost.author}
                      </span>

                      <span>
                        ·
                      </span>

                      <span>
                        {featuredPost.date.toLocaleDateString(
                          "en-IN",
                          {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          }
                        )}
                      </span>

                      <span>
                        ·
                      </span>

                      <span>
                        {featuredPost.readingTime} min read
                      </span>

                    </div>

                    <Link
                      href={`/blog/${featuredPost.slug}`}
                      className="read-link"
                    >
                      Read Story →
                    </Link>

                  </div>

                </article>

              </section>

            )}


            {/* ALL POSTS */}

            {remainingPosts.length > 0 && (

              <section className="posts-section">

                <div className="section-label">
                  More Stories
                </div>

                <div className="posts-grid">

                  {remainingPosts.map(
                    (post) => (

                      <article
                        key={post.id}
                        className="post-card"
                      >

                        <Link
                          href={`/blog/${post.slug}`}
                        >

                          <div className="post-image">

                            {post.coverImage ? (

                              <img
                                src={
                                  post.coverImage
                                }
                                alt={
                                  post.title
                                }
                              />

                            ) : (

                              <div className="post-placeholder">
                                No cover image
                              </div>

                            )}

                          </div>

                        </Link>


                        <div className="post-body">

                          <span className="post-category">
                            {post.category}
                          </span>

                          <h2>
                            {post.title}
                          </h2>

                          <p className="post-excerpt">
                            {post.excerpt}
                          </p>


                          <div className="post-footer">

                            <span className="post-date">
                              {post.date.toLocaleDateString(
                                "en-IN",
                                {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                }
                              )}
                            </span>

                            <span className="post-read">
                              {post.readingTime} min read
                              {" · "}
                              Read →
                            </span>

                          </div>

                        </div>

                      </article>

                    )
                  )}

                </div>

              </section>

            )}

          </>

        )}

      </main>
    </>
  );
}