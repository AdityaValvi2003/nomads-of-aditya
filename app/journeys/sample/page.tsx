import Link from "next/link";

export default function JourneySample() {
  return (
    <main>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="detail-hero journey-detail-hero">

        <div className="detail-hero-content">

          <span className="eyebrow">
            MAHARASHTRA · INDIA
          </span>

          <h1>
            The road is always more than the destination.
          </h1>

          <p className="detail-meta">
            A journey through roads, mountains, rain and
            unexpected moments.
          </p>

        </div>

      </section>


      {/* =====================================================
          STORY INTRO
      ===================================================== */}

      <section className="article journey-article">

        <div className="journey-story-intro">

          <span className="eyebrow">
            THE BEGINNING
          </span>

          <h2>
            Sometimes you leave without knowing exactly
            what you're looking for.
          </h2>

          <p>
            Some journeys begin with a destination.
            Others begin with a simple feeling that you
            need to get away for a while.
          </p>

          <p>
            This was one of those journeys.
          </p>

        </div>


        {/* =================================================
            PHOTO
        ================================================= */}

        <figure className="story-image story-image-large">

          <img
            src="/images/aditya-hero.jpeg"
            alt="Mountain road in Maharashtra"
          />

          <figcaption>
            Somewhere along the road — Maharashtra, India.
          </figcaption>

        </figure>


        {/* =================================================
            STORY
        ================================================= */}

        <section className="story-section">

          <span className="eyebrow">
            ON THE ROAD
          </span>

          <h2>
            The road started becoming the destination.
          </h2>

          <p>
            The further I travelled, the less important
            the original plan seemed to become.
          </p>

          <p>
            Roads disappeared into the mountains.
            Clouds moved across the hills.
            Rain came and went without warning.
          </p>

          <p>
            And somewhere between one turn and the next,
            I stopped thinking about where I was supposed
            to be going.
          </p>

          <blockquote>
            "Sometimes the best part of a journey is
            forgetting where you planned to go."
          </blockquote>

        </section>


        {/* =================================================
            IMAGE GRID
        ================================================= */}

        <div className="story-image-grid">

          <figure className="story-image">

            <img
              src="/images/aditya-hero.jpeg"
              alt="Mountain landscape"
            />

          </figure>

          <figure className="story-image">

            <img
              src="/images/aditya-hero.jpeg"
              alt="Road through the mountains"
            />

          </figure>

        </div>


        {/* =================================================
            PEOPLE
        ================================================= */}

        <section className="story-section">

          <span className="eyebrow">
            THE PEOPLE
          </span>

          <h2>
            The places matter. The people matter more.
          </h2>

          <p>
            One of the things I love about travelling is
            how quickly strangers can become part of a
            memory.
          </p>

          <p>
            A conversation at a roadside stop.
            Someone pointing toward a better road.
            A smile from someone you'll probably never
            meet again.
          </p>

          <p>
            These small moments rarely make it onto a
            map, but somehow they become the parts of a
            journey that stay with you.
          </p>

        </section>


        {/* =================================================
            LARGE QUOTE
        ================================================= */}

        <section className="story-quote">

          <p>
            "You remember the feeling long after
            you forget the route."
          </p>

        </section>


        {/* =================================================
            REFLECTION
        ================================================= */}

        <section className="story-section">

          <span className="eyebrow">
            WHAT I BROUGHT BACK
          </span>

          <h2>
            Not souvenirs. Perspective.
          </h2>

          <p>
            Every journey leaves something behind.
          </p>

          <p>
            Sometimes it is a photograph.
            Sometimes a story.
            Sometimes just a different way of looking
            at something you thought you already understood.
          </p>

          <p>
            I came back with more questions than answers.
            And honestly, I think that's a good thing.
          </p>

        </section>


        {/* =================================================
            JOURNEY DETAILS
        ================================================= */}

        <section className="journey-facts">

          <div>
            <span className="eyebrow">
              LOCATION
            </span>

            <strong>
              Maharashtra, India
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              TYPE
            </span>

            <strong>
              Road Journey
            </strong>
          </div>

          <div>
            <span className="eyebrow">
              MEMORIES
            </span>

            <strong>
              Roads · Mountains · People
            </strong>
          </div>

        </section>

      </section>


      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="journey-detail-closing">

        <span className="eyebrow">
          UNTIL THE NEXT ROAD
        </span>

        <h2>
          The journey continues.
        </h2>

        <p className="lead">
          There are still places I've never seen,
          roads I've never taken and stories I haven't
          written yet.
        </p>

        <div className="actions">

          <Link
            className="btn primary"
            href="/journeys"
          >
            Back to journeys →
          </Link>

          <Link
            className="btn"
            href="/dream-destinations"
          >
            Dream destinations →
          </Link>

        </div>

      </section>

    </main>
  );
}