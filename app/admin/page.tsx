"use client";

import { useState } from "react";

export default function AdminPage() {
  const [activeSection, setActiveSection] = useState("dashboard");

  const stats = [
    {
      number: "01",
      label: "Journeys",
      description: "Travel stories published",
    },
    {
      number: "03",
      label: "Blog Posts",
      description: "Thoughts and reflections",
    },
    {
      number: "05",
      label: "Destinations",
      description: "Dream places to explore",
    },
    {
      number: "01",
      label: "Drafts",
      description: "Stories waiting to be published",
    },
  ];

  const journeys = [
    {
      id: 1,
      title: "The road is always more than the destination.",
      location: "Maharashtra · India",
      status: "Published",
      type: "Road Journey",
    },
  ];

  return (
    <main className="admin-page">

      {/* =====================================================
          ADMIN HEADER
      ===================================================== */}

      <header className="admin-header">

        <div>
          <span className="admin-eyebrow">
            NOMADS OF ADITYA
          </span>

          <h1>Admin</h1>
        </div>

        <div className="admin-header-right">

          <a
            href="/"
            className="admin-view-site"
          >
            View Website →
          </a>

          <div className="admin-avatar">
            A
          </div>

        </div>

      </header>


      {/* =====================================================
          ADMIN NAVIGATION
      ===================================================== */}

      <nav className="admin-navigation">

        <button
          className={
            activeSection === "dashboard"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("dashboard")
          }
        >
          Dashboard
        </button>

        <button
          className={
            activeSection === "journeys"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("journeys")
          }
        >
          Journeys
        </button>

        <button
          className={
            activeSection === "blog"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("blog")
          }
        >
          Blog
        </button>

        <button
          className={
            activeSection === "destinations"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("destinations")
          }
        >
          Dream Destinations
        </button>

        <button
          className={
            activeSection === "media"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("media")
          }
        >
          Media
        </button>

        <button
          className={
            activeSection === "settings"
              ? "active"
              : ""
          }
          onClick={() =>
            setActiveSection("settings")
          }
        >
          Settings
        </button>

      </nav>


      {/* =====================================================
          DASHBOARD
      ===================================================== */}

      {activeSection === "dashboard" && (
        <section className="admin-content">

          <div className="admin-intro">

            <div>
              <span className="admin-eyebrow">
                CONTROL CENTER
              </span>

              <h2>
                Welcome back.
              </h2>

              <p>
                Everything you publish on Nomads of
                Aditya will eventually be managed from
                here.
              </p>
            </div>

          </div>


          {/* STATS */}

          <div className="admin-stats">

            {stats.map((stat) => (
              <div
                className="admin-stat"
                key={stat.label}
              >

                <span>
                  {stat.label}
                </span>

                <strong>
                  {stat.number}
                </strong>

                <p>
                  {stat.description}
                </p>

              </div>
            ))}

          </div>


          {/* RECENT CONTENT */}

          <div className="admin-section">

            <div className="admin-section-header">

              <div>
                <span className="admin-eyebrow">
                  RECENT CONTENT
                </span>

                <h3>
                  Your latest stories
                </h3>
              </div>

              <button
                className="admin-button"
                onClick={() =>
                  setActiveSection("journeys")
                }
              >
                Manage Journeys →
              </button>

            </div>


            <div className="admin-table">

              <div className="admin-table-header">
                <span>Title</span>
                <span>Location</span>
                <span>Type</span>
                <span>Status</span>
              </div>


              {journeys.map((journey) => (
                <div
                  className="admin-table-row"
                  key={journey.id}
                >

                  <strong>
                    {journey.title}
                  </strong>

                  <span>
                    {journey.location}
                  </span>

                  <span>
                    {journey.type}
                  </span>

                  <span className="status">
                    {journey.status}
                  </span>

                </div>
              ))}

            </div>

          </div>


          {/* QUICK ACTIONS */}

          <div className="admin-section">

            <div className="admin-section-header">

              <div>
                <span className="admin-eyebrow">
                  QUICK ACTIONS
                </span>

                <h3>
                  Create something new.
                </h3>
              </div>

            </div>


            <div className="quick-actions">

              <button
                onClick={() =>
                  setActiveSection("journeys")
                }
              >
                <span>01</span>
                <strong>
                  New Journey
                </strong>
                <small>
                  Write a new travel story
                </small>
              </button>


              <button
                onClick={() =>
                  setActiveSection("blog")
                }
              >
                <span>02</span>
                <strong>
                  New Blog Post
                </strong>
                <small>
                  Share something from your mind
                </small>
              </button>


              <button
                onClick={() =>
                  setActiveSection("destinations")
                }
              >
                <span>03</span>
                <strong>
                  New Destination
                </strong>
                <small>
                  Add a place to your dream list
                </small>
              </button>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          JOURNEYS
      ===================================================== */}

      {activeSection === "journeys" && (
        <section className="admin-content">

          <div className="admin-page-heading">

            <div>
              <span className="admin-eyebrow">
                CONTENT
              </span>

              <h2>
                Journeys
              </h2>

              <p>
                Manage the journeys that appear on
                your website.
              </p>
            </div>

            <button className="admin-button primary">
              + New Journey
            </button>

          </div>


          <div className="content-list">

            {journeys.map((journey) => (
              <article
                className="content-item"
                key={journey.id}
              >

                <div className="content-item-image">
                  <div />
                </div>

                <div className="content-item-info">

                  <span className="admin-eyebrow">
                    {journey.location}
                  </span>

                  <h3>
                    {journey.title}
                  </h3>

                  <p>
                    {journey.type}
                  </p>

                  <div className="content-item-actions">

                    <button>
                      Edit
                    </button>

                    <a
                      href="/journeys/sample"
                      target="_blank"
                    >
                      View
                    </a>

                    <button className="danger">
                      Delete
                    </button>

                  </div>

                </div>

                <div className="content-status">
                  {journey.status}
                </div>

              </article>
            ))}


            {/* FUTURE EMPTY STATE */}

            <div className="empty-content">

              <span className="admin-eyebrow">
                NEXT STORY
              </span>

              <h3>
                Your next journey belongs here.
              </h3>

              <p>
                Create a journey and it will appear
                automatically on your public website.
              </p>

              <button className="admin-button primary">
                + Create Journey
              </button>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          BLOG
      ===================================================== */}

      {activeSection === "blog" && (
        <section className="admin-content">

          <div className="admin-page-heading">

            <div>
              <span className="admin-eyebrow">
                CONTENT
              </span>

              <h2>
                Blog
              </h2>

              <p>
                Manage your thoughts, stories and
                reflections.
              </p>
            </div>

            <button className="admin-button primary">
              + New Blog Post
            </button>

          </div>


          <div className="empty-content large">

            <span className="admin-eyebrow">
              BLOG MANAGER
            </span>

            <h3>
              Your thoughts will live here.
            </h3>

            <p>
              Soon you'll be able to write, edit,
              publish and organize every blog post
              from this dashboard.
            </p>

          </div>

        </section>
      )}


      {/* =====================================================
          DESTINATIONS
      ===================================================== */}

      {activeSection === "destinations" && (
        <section className="admin-content">

          <div className="admin-page-heading">

            <div>
              <span className="admin-eyebrow">
                PLACES
              </span>

              <h2>
                Dream Destinations
              </h2>

              <p>
                Manage the places you want to explore
                one day.
              </p>
            </div>

            <button className="admin-button primary">
              + New Destination
            </button>

          </div>


          <div className="destination-admin-grid">

            {[
              "Nepal",
              "Japan",
              "Iceland",
              "Bhutan",
              "Norway",
            ].map((destination, index) => (

              <div
                className="destination-admin-card"
                key={destination}
              >

                <span>
                  0{index + 1}
                </span>

                <h3>
                  {destination}
                </h3>

                <small>
                  ONE DAY
                </small>

                <button>
                  Edit →
                </button>

              </div>

            ))}

          </div>

        </section>
      )}


      {/* =====================================================
          MEDIA
      ===================================================== */}

      {activeSection === "media" && (
        <section className="admin-content">

          <div className="admin-page-heading">

            <div>
              <span className="admin-eyebrow">
                PHOTOGRAPHS
              </span>

              <h2>
                Media
              </h2>

              <p>
                Your travel photographs and website
                images will be managed here.
              </p>
            </div>

            <button className="admin-button primary">
              + Upload Images
            </button>

          </div>


          <div className="empty-content large">

            <span className="admin-eyebrow">
              MEDIA LIBRARY
            </span>

            <h3>
              Your photographs belong here.
            </h3>

            <p>
              We'll connect this section to image
              storage after the content system is
              connected to the database.
            </p>

          </div>

        </section>
      )}


      {/* =====================================================
          SETTINGS
      ===================================================== */}

      {activeSection === "settings" && (
        <section className="admin-content">

          <div className="admin-page-heading">

            <div>
              <span className="admin-eyebrow">
                WEBSITE
              </span>

              <h2>
                Settings
              </h2>

              <p>
                Control the identity and behaviour of
                Nomads of Aditya.
              </p>
            </div>

          </div>


          <div className="settings-list">

            <div className="setting-row">

              <div>
                <strong>
                  Website Name
                </strong>

                <p>
                  The name displayed throughout the
                  website.
                </p>
              </div>

              <span>
                NOMADS OF ADITYA
              </span>

            </div>


            <div className="setting-row">

              <div>
                <strong>
                  Theme
                </strong>

                <p>
                  Default website appearance.
                </p>
              </div>

              <span>
                Dark
              </span>

            </div>


            <div className="setting-row">

              <div>
                <strong>
                  Content Management
                </strong>

                <p>
                  Database connection.
                </p>
              </div>

              <span className="status">
                Coming next
              </span>

            </div>

          </div>

        </section>
      )}


      {/* =====================================================
          ADMIN FOOTER
      ===================================================== */}

      <footer className="admin-footer">

        <span>
          NOMADS OF ADITYA
        </span>

        <span>
          Admin Console
        </span>

      </footer>


      {/* =====================================================
          ADMIN STYLES
      ===================================================== */}

      <style jsx>{`

        .admin-page {
          min-height: 100vh;
          background: #0b0b0a;
          color: #f4f0e8;
          padding-top: 100px;
        }

        .admin-header {
          padding: 70px 7vw 50px;
          border-bottom: 1px solid #2a2823;
          display: flex;
          justify-content: space-between;
          align-items: end;
        }

        .admin-eyebrow {
          display: block;
          color: #d99a3d;
          font-size: .68rem;
          font-weight: 700;
          letter-spacing: .2em;
        }

        .admin-header h1 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(3.5rem, 6vw, 6rem);
          font-weight: normal;
          line-height: .95;
          margin: 15px 0 0;
        }

        .admin-header-right {
          display: flex;
          align-items: center;
          gap: 25px;
        }

        .admin-view-site {
          border: 1px solid #2a2823;
          padding: 11px 18px;
          font-size: .75rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .admin-view-site:hover {
          border-color: #d99a3d;
          color: #d99a3d;
        }

        .admin-avatar {
          width: 42px;
          height: 42px;
          border: 1px solid #d99a3d;
          border-radius: 50%;
          display: grid;
          place-items: center;
          color: #d99a3d;
        }

        .admin-navigation {
          padding: 18px 7vw;
          border-bottom: 1px solid #2a2823;
          display: flex;
          gap: 8px;
          overflow-x: auto;
        }

        .admin-navigation button {
          white-space: nowrap;
          padding: 10px 16px;
          color: #aaa39a;
          font-size: .74rem;
          letter-spacing: .05em;
        }

        .admin-navigation button:hover {
          color: #f4f0e8;
        }

        .admin-navigation button.active {
          background: #d99a3d;
          color: #15110b;
        }

        .admin-content {
          padding: 80px 7vw 120px;
          max-width: 1500px;
          margin: auto;
        }

        .admin-intro {
          margin-bottom: 50px;
        }

        .admin-intro h2,
        .admin-page-heading h2 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(2.5rem, 5vw, 5rem);
          font-weight: normal;
          line-height: 1;
          margin: 12px 0 20px;
        }

        .admin-intro p,
        .admin-page-heading p {
          color: #aaa39a;
          max-width: 600px;
          font-size: 1rem;
        }

        .admin-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin-bottom: 100px;
        }

        .admin-stat {
          background: #141310;
          border: 1px solid #2a2823;
          padding: 28px;
        }

        .admin-stat > span {
          color: #aaa39a;
          font-size: .75rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .admin-stat strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 4rem;
          font-weight: normal;
          line-height: 1;
          margin: 25px 0 12px;
        }

        .admin-stat p {
          color: #aaa39a;
          font-size: .8rem;
          margin: 0;
        }

        .admin-section {
          margin-top: 80px;
        }

        .admin-section-header,
        .admin-page-heading {
          display: flex;
          justify-content: space-between;
          align-items: end;
          gap: 30px;
          margin-bottom: 35px;
        }

        .admin-section-header h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 2.3rem;
          font-weight: normal;
          margin: 10px 0 0;
        }

        .admin-button {
          border: 1px solid #2a2823;
          padding: 12px 18px;
          font-size: .72rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        .admin-button:hover {
          border-color: #d99a3d;
          color: #d99a3d;
        }

        .admin-button.primary {
          background: #d99a3d;
          border-color: #d99a3d;
          color: #15110b;
        }

        .admin-button.primary:hover {
          color: #15110b;
          background: #f0b35a;
        }

        .admin-table {
          border-top: 1px solid #2a2823;
        }

        .admin-table-header,
        .admin-table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr .8fr;
          gap: 25px;
          padding: 22px 10px;
          border-bottom: 1px solid #2a2823;
          align-items: center;
        }

        .admin-table-header {
          color: #aaa39a;
          font-size: .68rem;
          letter-spacing: .12em;
          text-transform: uppercase;
        }

        .admin-table-row {
          font-size: .85rem;
        }

        .admin-table-row strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 1.15rem;
          font-weight: normal;
        }

        .admin-table-row span {
          color: #aaa39a;
        }

        .status {
          color: #d99a3d !important;
        }

        .quick-actions {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .quick-actions button {
          text-align: left;
          border: 1px solid #2a2823;
          background: #141310;
          padding: 30px;
          transition: .25s ease;
        }

        .quick-actions button:hover {
          border-color: #d99a3d;
          transform: translateY(-3px);
        }

        .quick-actions span {
          color: #d99a3d;
          font-size: .7rem;
          letter-spacing: .1em;
        }

        .quick-actions strong {
          display: block;
          font-family: Georgia, "Times New Roman", serif;
          font-size: 1.7rem;
          font-weight: normal;
          margin: 25px 0 8px;
        }

        .quick-actions small {
          color: #aaa39a;
        }

        .content-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .content-item {
          position: relative;
          display: grid;
          grid-template-columns: 280px 1fr auto;
          gap: 30px;
          background: #141310;
          border: 1px solid #2a2823;
          overflow: hidden;
        }

        .content-item-image {
          min-height: 240px;
          background:
            linear-gradient(
              0deg,
              rgba(0,0,0,.6),
              transparent
            ),
            url("/images/aditya-hero.jpeg")
            center / cover;
        }

        .content-item-info {
          padding: 30px 20px 30px 0;
        }

        .content-item-info h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 2rem;
          font-weight: normal;
          line-height: 1.05;
          max-width: 650px;
          margin: 12px 0;
        }

        .content-item-info p {
          color: #aaa39a;
        }

        .content-item-actions {
          display: flex;
          gap: 8px;
          margin-top: 25px;
        }

        .content-item-actions button,
        .content-item-actions a {
          border: 1px solid #2a2823;
          padding: 8px 12px;
          font-size: .7rem;
          text-transform: uppercase;
          letter-spacing: .06em;
        }

        .content-item-actions button:hover,
        .content-item-actions a:hover {
          border-color: #d99a3d;
          color: #d99a3d;
        }

        .content-item-actions .danger:hover {
          border-color: #a85b52;
          color: #a85b52;
        }

        .content-status {
          padding: 30px;
          color: #d99a3d;
          font-size: .7rem;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .empty-content {
          min-height: 300px;
          border: 1px dashed #2a2823;
          padding: 55px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: flex-start;
          margin-top: 20px;
        }

        .empty-content.large {
          min-height: 450px;
        }

        .empty-content h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: clamp(2rem, 4vw, 4rem);
          font-weight: normal;
          margin: 15px 0;
        }

        .empty-content p {
          color: #aaa39a;
          max-width: 550px;
          margin-bottom: 25px;
        }

        .destination-admin-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 15px;
        }

        .destination-admin-card {
          min-height: 280px;
          padding: 25px;
          background:
            linear-gradient(
              0deg,
              rgba(0,0,0,.85),
              transparent
            ),
            url("/images/aditya-hero.jpeg")
            center / cover;
          display: flex;
          flex-direction: column;
          justify-content: end;
        }

        .destination-admin-card > span {
          color: #d99a3d;
          font-size: .7rem;
        }

        .destination-admin-card h3 {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 2rem;
          font-weight: normal;
          margin: 8px 0;
        }

        .destination-admin-card small {
          color: #aaa39a;
          font-size: .65rem;
          letter-spacing: .15em;
        }

        .destination-admin-card button {
          margin-top: 20px;
          text-align: left;
          color: #d99a3d;
          font-size: .7rem;
          text-transform: uppercase;
        }

        .settings-list {
          border-top: 1px solid #2a2823;
        }

        .setting-row {
          display: flex;
          justify-content: space-between;
          gap: 30px;
          padding: 30px 10px;
          border-bottom: 1px solid #2a2823;
        }

        .setting-row strong {
          font-family: Georgia, "Times New Roman", serif;
          font-size: 1.3rem;
          font-weight: normal;
        }

        .setting-row p {
          color: #aaa39a;
          margin: 5px 0 0;
        }

        .setting-row > span {
          color: #d99a3d;
          font-size: .75rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          white-space: nowrap;
        }

        .admin-footer {
          border-top: 1px solid #2a2823;
          padding: 35px 7vw;
          display: flex;
          justify-content: space-between;
          color: #aaa39a;
          font-size: .7rem;
          letter-spacing: .1em;
        }

        @media (max-width: 900px) {

          .admin-header {
            align-items: flex-start;
            flex-direction: column;
            gap: 30px;
          }

          .admin-header-right {
            width: 100%;
            justify-content: space-between;
          }

          .admin-stats {
            grid-template-columns: 1fr 1fr;
          }

          .quick-actions {
            grid-template-columns: 1fr;
          }

          .destination-admin-grid {
            grid-template-columns: 1fr 1fr;
          }

          .content-item {
            grid-template-columns: 200px 1fr;
          }

          .content-status {
            display: none;
          }

        }

        @media (max-width: 650px) {

          .admin-page {
            padding-top: 75px;
          }

          .admin-header {
            padding:
              50px
              7vw
              35px;
          }

          .admin-content {
            padding:
              55px
              7vw
              80px;
          }

          .admin-stats {
            grid-template-columns: 1fr;
          }

          .admin-section-header,
          .admin-page-heading {
            align-items: flex-start;
            flex-direction: column;
          }

          .admin-table {
            overflow-x: auto;
          }

          .admin-table-header,
          .admin-table-row {
            min-width: 700px;
          }

          .content-item {
            grid-template-columns: 1fr;
          }

          .content-item-image {
            min-height: 240px;
          }

          .content-item-info {
            padding: 25px;
          }

          .destination-admin-grid {
            grid-template-columns: 1fr;
          }

          .setting-row {
            flex-direction: column;
          }

          .admin-footer {
            flex-direction: column;
            gap: 10px;
          }

        }

      `}</style>

    </main>
  );
}