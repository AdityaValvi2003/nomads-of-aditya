import type { Metadata } from "next";
import Link from "next/link";

import { prisma } from "../../src/lib/prisma";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await prisma.siteSettings.findFirst();

    const ownerName =
        settings?.ownerName?.trim() ||
        "Aditya";

    return {
        title: `About ${ownerName} | Nomads of Aditya`,
        description:
            "The story, philosophy and journey behind Nomads of Aditya.",
    };
}

export default async function AboutPage() {
    const settings =
        await prisma.siteSettings.findFirst();

    const ownerName =
        settings?.ownerName?.trim() ||
        "Aditya";

    const siteName =
        settings?.siteName?.trim() ||
        "Nomads of Aditya";

    const aboutHeadline =
        settings?.aboutHeadline?.trim() ||
        `I'm ${ownerName}. Still figuring it out.`;

    const aboutLead =
        settings?.aboutLead?.trim() ||
        "I don't have my entire life figured out. I don't think anyone really does. I'm just trying to experience more of it, one journey, one conversation and one unexpected road at a time.";

    const aboutStoryTitle =
        settings?.aboutStoryTitle?.trim() ||
        "This isn't really a travel blog.";

    const aboutStoryLeft =
        settings?.aboutStoryLeft?.trim() ||
        `${siteName} started with a simple idea: life becomes a lot more interesting when you stop living it entirely on someone else's terms.

I've always been curious about what exists beyond the familiar. Different roads. Different places. Different people. Different ways of looking at life.

Somewhere along the way, travelling stopped being just about reaching a destination. The journey became the interesting part.`;

    const aboutStoryRight =
        settings?.aboutStoryRight?.trim() ||
        `The late-night drives. The wrong turns. The conversations with strangers. The places that weren't on the plan.

Those are often the moments that stay with me much longer than the destination itself.

This website is where I keep those moments.`;

    const aboutPhilosophy =
        settings?.aboutPhilosophy?.trim() ||
        "I don't think life should become a race for money, possessions and a version of success someone else chose for us.";

    const aboutFreedom =
        settings?.aboutFreedom?.trim() ||
        "Find the courage to choose your own direction.";

    const aboutExploration =
        settings?.aboutExploration?.trim() ||
        "Go see places, cultures and perspectives beyond your routine.";

    const aboutPeople =
        settings?.aboutPeople?.trim() ||
        "Every stranger carries a story worth hearing.";

    const aboutGrowth =
        settings?.aboutGrowth?.trim() ||
        "Your path can be slower and still be yours.";

    return (
        <main>

            {/* =====================================================
          INTRO
      ===================================================== */}

            <section className="section about-hero">

                <span className="eyebrow">
                    ABOUT THE NOMAD
                </span>

                <h1 className="about-title">
                    {aboutHeadline}
                </h1>

                <p className="about-lead">
                    {aboutLead}
                </p>

            </section>


            {/* =====================================================
          STORY
      ===================================================== */}

            <section className="section about-story">

                <div className="section-head">

                    <div>
                        <span className="eyebrow">
                            THE STORY
                        </span>

                        <h2>
  {aboutStoryTitle}
</h2>
                    </div>

                </div>

                <div className="about-story-grid">
<div>
  {aboutStoryLeft
    .split("\n\n")
    .map((paragraph, index) => (
      <p
        key={index}
        className={index === 0 ? "lead" : undefined}
      >
        {paragraph}
      </p>
    ))}
</div>
<div>
  {aboutStoryRight
    .split("\n\n")
    .map((paragraph, index) => (
      <p key={index}>
        {paragraph}
      </p>
    ))}
</div>

                </div>

            </section>


            {/* =====================================================
          PHILOSOPHY
      ===================================================== */}

            <section className="section philosophy">

                <div>

                    <span className="eyebrow">
                        WHAT I BELIEVE
                    </span>

                    <h2>
                        Before you build your life,
                        take the time to discover
                        what you want it to be.
                    </h2>

                </div>

                <div>

                    <p className="philosophy-copy">
  {aboutPhilosophy}
</p>

                    <div className="principles">

                        <div className="principle">
                            <strong>FREEDOM</strong>

                            <p>
  {aboutFreedom}
</p>
                        </div>

                        <div className="principle">
                            <strong>EXPLORATION</strong>

                            <p>
  {aboutExploration}
</p>
                        </div>

                        <div className="principle">
                            <strong>PEOPLE</strong>

                            <p>
  {aboutPeople}
</p>
                        </div>

                        <div className="principle">
                            <strong>GROWTH</strong>

                            <p>
  {aboutGrowth}
</p>
                        </div>

                    </div>

                </div>

            </section>


            {/* =====================================================
          WHAT YOU WILL FIND
      ===================================================== */}

            <section className="section">

                <div className="section-head">

                    <div>

                        <span className="eyebrow">
                            WHAT'S HERE
                        </span>

                        <h2>
                            More than places on a map.
                        </h2>

                    </div>

                </div>


                <div className="about-explore-grid">

                    <Link
                        href="/journeys"
                        className="about-explore-card"
                    >
                        <span>01</span>

                        <strong>
                            Journeys
                        </strong>

                        <p>
                            The roads I've travelled, the
                            places I've explored and the
                            stories that came back with me.
                        </p>

                        <small>
                            Explore journeys →
                        </small>
                    </Link>


                    <Link
                        href="/blog"
                        className="about-explore-card"
                    >
                        <span>02</span>

                        <strong>
                            Thoughts
                        </strong>

                        <p>
                            Things I've been thinking about,
                            learning from and occasionally
                            trying to make sense of.
                        </p>

                        <small>
                            Read the blog →
                        </small>
                    </Link>


                    <Link
                        href="/dream-destinations"
                        className="about-explore-card"
                    >
                        <span>03</span>

                        <strong>
                            Dream Destinations
                        </strong>

                        <p>
                            Places I haven't seen yet but
                            definitely want to someday.
                        </p>

                        <small>
                            See the list →
                        </small>
                    </Link>


                    <Link
                        href="/contact"
                        className="about-explore-card"
                    >
                        <span>04</span>

                        <strong>
                            Conversations
                        </strong>

                        <p>
                            Because some of the best journeys
                            begin with a simple conversation.
                        </p>

                        <small>
                            Let's connect →
                        </small>
                    </Link>

                </div>

            </section>


            {/* =====================================================
          CLOSING
      ===================================================== */}

            <section className="section about-closing">

                <span className="eyebrow">
                    THE JOURNEY CONTINUES
                </span>

                <h2>
                    I don't know where
                    the road ends.
                </h2>

                <p className="lead">
                    And honestly, that's probably
                    the best part.
                </p>

                <div className="actions">

                    <Link
                        className="btn primary"
                        href="/journeys"
                    >
                        Explore my journeys →
                    </Link>

                    <Link
                        className="btn"
                        href="/contact"
                    >
                        Let's connect →
                    </Link>

                </div>

            </section>

        </main>
    );
}