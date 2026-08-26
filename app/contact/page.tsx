"use client";

import { FormEvent, useState } from "react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setSending(true);
    setSuccess(false);
    setError("");

    try {
      const response = await fetch(
        "/api/contact",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            name,
            email,
            message,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Something went wrong."
        );
      }

      setSuccess(true);

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong while sending your message."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="contact-page">

      {/* =====================================================
          INTRO
      ===================================================== */}

      <section className="section contact-hero">

        <span className="eyebrow">
          LET'S TALK
        </span>

        <h1 className="contact-title">
          Have something
          <br />
          to say?
        </h1>

        <p className="contact-lead">
          Whether you want to talk about a journey,
          share an idea, say hello, or simply tell me
          about a place I should visit — I'd love to
          hear from you.
        </p>

      </section>


      {/* =====================================================
          CONTACT CONTENT
      ===================================================== */}

      <section className="section contact-content">

        <div className="contact-info">

          <span className="eyebrow">
            GET IN TOUCH
          </span>

          <h2>
            Start a conversation.
          </h2>

          <p>
            Some of the best journeys begin with
            a simple conversation.
          </p>

          <div className="contact-details">

            <div>
              <span>
                EMAIL
              </span>

              <a href="mailto:hello@nomadsofaditya.com">
                hello@nomadsofaditya.com
              </a>
            </div>

            <div>
              <span>
                BASED IN
              </span>

              <p>
                Maharashtra, India
              </p>
            </div>

          </div>

        </div>


        {/* ===================================================
            FORM
        =================================================== */}

        <form
          className="contact-form"
          onSubmit={handleSubmit}
        >

          <label className="contact-field">

            <span>
              YOUR NAME
            </span>

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value
                )
              }
              placeholder="Your name"
              required
              maxLength={100}
            />

          </label>


          <label className="contact-field">

            <span>
              EMAIL ADDRESS
            </span>

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value
                )
              }
              placeholder="you@example.com"
              required
              maxLength={255}
            />

          </label>


          <label className="contact-field">

            <span>
              MESSAGE
            </span>

            <textarea
              value={message}
              onChange={(event) =>
                setMessage(
                  event.target.value
                )
              }
              placeholder="Tell me what's on your mind..."
              required
              minLength={10}
              maxLength={5000}
              rows={8}
            />

          </label>


          {error && (
            <div className="contact-message error">
              {error}
            </div>
          )}


          {success && (
            <div className="contact-message success">
              Thanks for reaching out.
              Your message has been received.
            </div>
          )}


          <button
            type="submit"
            className="btn primary contact-submit"
            disabled={sending}
          >
            {sending
              ? "Sending..."
              : "Send message →"}
          </button>

        </form>

      </section>


      {/* =====================================================
          CLOSING
      ===================================================== */}

      <section className="section contact-closing">

        <span className="eyebrow">
          UNTIL THEN
        </span>

        <h2>
          Keep exploring.
        </h2>

        <p>
          There is always another road,
          another story and another
          conversation waiting.
        </p>

      </section>

    </main>
  );
}