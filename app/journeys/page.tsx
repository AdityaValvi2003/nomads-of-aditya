import Link from "next/link";

export default function Journeys() {
  return (
    <main>

      {/* INTRO */}
      <section className="page journey-intro">
        <span className="eyebrow">REAL TRIPS · REAL STORIES</span>

        <h1>My Journeys</h1>

        <p className="lead">
          Places I've actually been, people I've met, photographs I've
          collected and things I brought back with me.
        </p>
      </section>


      {/* FEATURED JOURNEY */}
      <section className="journeys-feature">

        <div className="journeys-feature-image" />

        <div className="journeys-feature-overlay">

          <span className="eyebrow">
            FEATURED JOURNEY · MAHARASHTRA · INDIA
          </span>

          <h2>
            The road is always more than the destination.
          </h2>

          <p>
            A journey through the roads, mountains and moments that made
            the trip worth remembering.
          </p>

          <Link
            className="btn primary"
            href="/journeys/sample"
          >
            Enter journey →
          </Link>

        </div>
      </section>


      {/* JOURNEY ARCHIVE */}
      <section className="section journeys-list">

        <div className="section-head">

          <div>
            <span className="eyebrow">
              THE ROAD SO FAR
            </span>

            <h2>
              Stories from the road.
            </h2>
          </div>

          <p className="lead">
            Every journey will eventually become a story —
            with photographs, people, places and memories.
          </p>

        </div>


        <div className="journey-grid">

          {/* Existing journey */}
          <article className="journey-card">

            <div className="journey-card-image" />

            <div className="journey-card-content">

              <span className="eyebrow">
                MAHARASHTRA · INDIA
              </span>

              <h3>
                The road is always more than the destination.
              </h3>

              <p>
                A first working journey placeholder. The final story
                will be managed entirely from Admin.
              </p>

              <Link
                className="btn"
                href="/journeys/sample"
              >
                Enter journey →
              </Link>

            </div>

          </article>


          {/* Future journeys */}
          <article className="journey-card journey-card-empty">

            <div className="journey-card-content">

              <span className="eyebrow">
                MORE TO COME
              </span>

              <h3>
                The map is still being filled.
              </h3>

              <p>
                New journeys, photographs and stories will appear here
                as the road continues.
              </p>

            </div>

          </article>

        </div>

      </section>


      {/* CLOSING */}
      <section className="journey-closing">

        <span className="eyebrow">
          STILL EXPLORING
        </span>

        <h2>
          There are still many roads left to take.
        </h2>

        <p className="lead">
          This is only the beginning. More places, people and stories
          will find their way here.
        </p>

        <div className="actions">

          <Link
            className="btn primary"
            href="/dream-destinations"
          >
            Dream destinations →
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