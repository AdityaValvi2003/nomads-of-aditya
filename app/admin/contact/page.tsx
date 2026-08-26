"use client";

import { useEffect, useMemo, useState } from "react";

type MessageStatus = "UNREAD" | "READ";

type ContactMessage = {
  id: string;
  name: string;
  email: string;
  message: string;
  status: MessageStatus;
  createdAt: string;
  updatedAt: string;
};

type Filter = "ALL" | "UNREAD" | "READ";

export default function AdminContactPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [filter, setFilter] = useState<Filter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);

  async function loadMessages() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        "/api/admin/contact",
        {
          cache: "no-store",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to load messages."
        );
      }

      const data = await response.json();

setMessages(data);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to load contact messages."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMessages();
  }, []);

  async function updateStatus(
    id: string,
    status: MessageStatus
  ) {
    try {
      setBusyId(id);

      const response = await fetch(
        `/api/admin/contact/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to update message."
        );
      }

      setMessages((current) =>
        current.map((message) =>
          message.id === id
            ? {
                ...message,
                status,
              }
            : message
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to update the message."
      );
    } finally {
      setBusyId(null);
    }
  }

  async function deleteMessage(id: string) {
    const confirmed = window.confirm(
      "Delete this message? This cannot be undone."
    );

    if (!confirmed) {
      return;
    }

    try {
      setBusyId(id);

      const response = await fetch(
        `/api/admin/contact/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error(
          "Failed to delete message."
        );
      }

      setMessages((current) =>
        current.filter(
          (message) => message.id !== id
        )
      );
    } catch (error) {
      console.error(error);

      setError(
        "Unable to delete the message."
      );
    } finally {
      setBusyId(null);
    }
  }

  const unreadCount = messages.filter(
    (message) =>
      message.status === "UNREAD"
  ).length;

  const filteredMessages = useMemo(() => {
    if (filter === "ALL") {
      return messages;
    }

    return messages.filter(
      (message) =>
        message.status === filter
    );
  }, [messages, filter]);

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(new Date(date));
  }

  return (
    <main className="admin-page contact-admin-page">
      <style jsx>{`
        .contact-admin-page {
          min-height: 100vh;
        }

        .contact-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
          margin-bottom: 42px;
        }

        .contact-header-copy {
          max-width: 760px;
        }

        .contact-header h1 {
          margin: 10px 0 12px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: clamp(48px, 6vw, 78px);
          font-weight: 400;
          line-height: 0.95;
          letter-spacing: -0.045em;
        }

        .contact-header p {
          margin: 0;
          max-width: 620px;
          color: rgba(255, 255, 255, 0.45);
          font-size: 15px;
          line-height: 1.7;
        }

        .contact-header-actions {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-shrink: 0;
        }

        .unread-count {
          color: rgba(255, 255, 255, 0.65);
          font-size: 13px;
          white-space: nowrap;
        }

        .unread-count strong {
          color: #d9a441;
          font-weight: 600;
        }

        .refresh-button {
          min-height: 42px;
          padding: 0 18px;
          border: 1px solid
            rgba(255, 255, 255, 0.1);
          background: transparent;
          color: rgba(255, 255, 255, 0.8);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease;
        }

        .refresh-button:hover {
          border-color: rgba(255, 255, 255, 0.2);
          background: rgba(255, 255, 255, 0.04);
        }

        .refresh-button:disabled {
          opacity: 0.45;
          cursor: wait;
        }

        .contact-toolbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          padding: 18px 0;
          border-top: 1px solid
            rgba(255, 255, 255, 0.07);
          border-bottom: 1px solid
            rgba(255, 255, 255, 0.07);
          margin-bottom: 24px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .filter-button {
          padding: 9px 14px;
          border: 1px solid transparent;
          background: transparent;
          color: rgba(255, 255, 255, 0.42);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            color 0.2s ease,
            background 0.2s ease,
            border-color 0.2s ease;
        }

        .filter-button:hover {
          color: rgba(255, 255, 255, 0.75);
        }

        .filter-button.active {
          border-color: rgba(255, 255, 255, 0.1);
          background: rgba(255, 255, 255, 0.04);
          color: white;
        }

        .message-count {
          color: rgba(255, 255, 255, 0.3);
          font-size: 12px;
        }

        .error-message {
          margin-bottom: 24px;
          padding: 14px 16px;
          border: 1px solid
            rgba(220, 80, 80, 0.2);
          background: rgba(220, 80, 80, 0.06);
          color: #e79a9a;
          font-size: 13px;
        }

        .messages-list {
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .message-card {
          position: relative;
          padding: 26px 28px;
          border: 1px solid
            rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.018);
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            transform 0.2s ease;
        }

        .message-card:hover {
          border-color: rgba(255, 255, 255, 0.14);
          background: rgba(255, 255, 255, 0.025);
        }

        .message-card.unread {
          border-color: rgba(217, 164, 65, 0.2);
        }

        .message-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 24px;
          margin-bottom: 22px;
        }

        .sender {
          display: flex;
          align-items: flex-start;
          gap: 13px;
          min-width: 0;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          margin-top: 6px;
          border-radius: 50%;
          flex-shrink: 0;
          background: rgba(255, 255, 255, 0.2);
        }

        .status-dot.unread {
          background: #d9a441;
          box-shadow: 0 0 0 4px
            rgba(217, 164, 65, 0.08);
        }

        .sender-name {
          margin: 0 0 4px;
          color: rgba(255, 255, 255, 0.95);
          font-size: 16px;
          font-weight: 500;
        }

        .sender-email {
          color: rgba(255, 255, 255, 0.38);
          font-size: 13px;
          word-break: break-word;
        }

        .sender-email:hover {
          color: rgba(255, 255, 255, 0.7);
        }

        .message-date {
          color: rgba(255, 255, 255, 0.3);
          font-size: 11px;
          white-space: nowrap;
        }

        .message-body {
          max-width: 900px;
          margin-bottom: 26px;
          color: rgba(255, 255, 255, 0.72);
          font-size: 15px;
          line-height: 1.75;
          white-space: pre-wrap;
          word-break: break-word;
        }

        .message-actions {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding-top: 18px;
          border-top: 1px solid
            rgba(255, 255, 255, 0.06);
        }

        .message-status {
          color: rgba(255, 255, 255, 0.3);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
        }

        .message-status.unread {
          color: #d9a441;
        }

        .action-group {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .action-button {
          min-height: 36px;
          padding: 0 13px;
          border: 1px solid
            rgba(255, 255, 255, 0.09);
          background: transparent;
          color: rgba(255, 255, 255, 0.55);
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          cursor: pointer;
          transition:
            border-color 0.2s ease,
            background 0.2s ease,
            color 0.2s ease;
        }

        .action-button:hover {
          border-color: rgba(255, 255, 255, 0.18);
          background: rgba(255, 255, 255, 0.04);
          color: white;
        }

        .action-button.primary {
          border-color: rgba(217, 164, 65, 0.35);
          color: #d9a441;
        }

        .action-button.primary:hover {
          border-color: rgba(217, 164, 65, 0.55);
          background: rgba(217, 164, 65, 0.07);
        }

        .action-button.danger:hover {
          border-color: rgba(220, 80, 80, 0.35);
          color: #e79a9a;
        }

        .action-button:disabled {
          opacity: 0.35;
          cursor: wait;
        }

        .empty-state {
          padding: 100px 30px;
          border: 1px solid
            rgba(255, 255, 255, 0.07);
          text-align: center;
        }

        .empty-eyebrow {
          display: block;
          margin-bottom: 14px;
          color: #d9a441;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
        }

        .empty-state h2 {
          margin: 0 0 10px;
          font-family: Georgia, "Times New Roman",
            serif;
          font-size: 34px;
          font-weight: 400;
          letter-spacing: -0.03em;
        }

        .empty-state p {
          max-width: 420px;
          margin: 0 auto;
          color: rgba(255, 255, 255, 0.38);
          font-size: 14px;
          line-height: 1.7;
        }

        .loading-state {
          padding: 80px 0;
          color: rgba(255, 255, 255, 0.35);
          font-size: 13px;
        }

        @media (max-width: 760px) {
          .contact-header {
            align-items: flex-start;
            flex-direction: column;
            margin-bottom: 30px;
          }

          .contact-header h1 {
            font-size: 48px;
          }

          .contact-header-actions {
            width: 100%;
            justify-content: space-between;
          }

          .contact-toolbar {
            align-items: flex-start;
            flex-direction: column;
          }

          .message-card {
            padding: 20px;
          }

          .message-top {
            flex-direction: column;
            gap: 12px;
          }

          .message-date {
            padding-left: 21px;
          }

          .message-actions {
            align-items: flex-start;
            flex-direction: column;
          }

          .action-group {
            width: 100%;
            flex-wrap: wrap;
          }
        }
      `}</style>

      <div className="admin-content">
        <header className="contact-header">
          <div className="contact-header-copy">
            <span className="admin-eyebrow">
              INBOX
            </span>

            <h1>Contact Messages</h1>

            <p>
              Messages sent through your website.
              Keep track of conversations,
              respond to people, and manage your
              inbox from here.
            </p>
          </div>

          <div className="contact-header-actions">
            <span className="unread-count">
              <strong>{unreadCount}</strong>{" "}
              unread
            </span>

            <button
              type="button"
              className="refresh-button"
              onClick={loadMessages}
              disabled={loading}
            >
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </header>

        <div className="contact-toolbar">
          <div className="filter-group">
            {(
              [
                ["ALL", "All"],
                ["UNREAD", "Unread"],
                ["READ", "Read"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                className={
                  filter === value
                    ? "filter-button active"
                    : "filter-button"
                }
                onClick={() =>
                  setFilter(value)
                }
              >
                {label}
              </button>
            ))}
          </div>

          <span className="message-count">
            {filteredMessages.length}{" "}
            {filteredMessages.length === 1
              ? "message"
              : "messages"}
          </span>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {loading ? (
          <div className="loading-state">
            Loading messages...
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="empty-state">
            <span className="empty-eyebrow">
              {filter === "ALL"
                ? "EMPTY INBOX"
                : `NO ${filter.toLowerCase()} MESSAGES`}
            </span>

            <h2>
              {filter === "ALL"
                ? "No messages yet."
                : "Nothing here."}
            </h2>

            <p>
              {filter === "ALL"
                ? "Messages submitted through the contact page will appear here."
                : `There are currently no ${filter.toLowerCase()} messages.`}
            </p>
          </div>
        ) : (
          <div className="messages-list">
            {filteredMessages.map(
              (message) => {
                const isUnread =
                  message.status === "UNREAD";

                const isBusy =
                  busyId === message.id;

                return (
                  <article
                    key={message.id}
                    className={
                      isUnread
                        ? "message-card unread"
                        : "message-card"
                    }
                  >
                    <div className="message-top">
                      <div className="sender">
                        <span
                          className={
                            isUnread
                              ? "status-dot unread"
                              : "status-dot"
                          }
                        />

                        <div>
                          <h2 className="sender-name">
                            {message.name}
                          </h2>

                          <a
                            className="sender-email"
                            href={`mailto:${message.email}`}
                          >
                            {message.email}
                          </a>
                        </div>
                      </div>

                      <time className="message-date">
                        {formatDate(
                          message.createdAt
                        )}
                      </time>
                    </div>

                    <div className="message-body">
                      {message.message}
                    </div>

                    <div className="message-actions">
                      <span
                        className={
                          isUnread
                            ? "message-status unread"
                            : "message-status"
                        }
                      >
                        {isUnread
                          ? "Unread"
                          : "Read"}
                      </span>

                      <div className="action-group">
                        <button
                          type="button"
                          className="action-button primary"
                          disabled={isBusy}
                          onClick={() =>
                            updateStatus(
                              message.id,
                              isUnread
                                ? "READ"
                                : "UNREAD"
                            )
                          }
                        >
                          {isUnread
                            ? "Mark as read"
                            : "Mark as unread"}
                        </button>

                        <a
                          className="action-button"
                          href={`mailto:${message.email}?subject=${encodeURIComponent(
                            "Re: Your message to Nomads of Aditya"
                          )}`}
                        >
                          Reply by email →
                        </a>

                        <button
                          type="button"
                          className="action-button danger"
                          disabled={isBusy}
                          onClick={() =>
                            deleteMessage(
                              message.id
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              }
            )}
          </div>
        )}
      </div>
    </main>
  );
}