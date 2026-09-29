import { useEffect, useState } from "react";
import {
  deleteMessage,
  getMessages,
  markMessageAsRead,
} from "../../api/message";

function formatDate(date) {
  return new Intl.DateTimeFormat("en-LK", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(date));
}

function Messages() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let isMounted = true;

    getMessages()
      .then((loadedMessages) => {
        if (isMounted) setMessages(loadedMessages);
      })
      .catch((loadError) => {
        if (isMounted) {
          setError(
            loadError.response?.data?.message || "Unable to load messages.",
          );
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleRead(message) {
    if (message.isRead) return;
    setBusyId(message._id);
    setError("");
    setNotice("");
    try {
      const updatedMessage = await markMessageAsRead(message._id);
      setMessages((currentMessages) =>
        currentMessages.map((currentMessage) =>
          currentMessage._id === message._id ? updatedMessage : currentMessage,
        ),
      );
      setNotice("Message marked as read.");
    } catch (readError) {
      setError(
        readError.response?.data?.message || "Unable to mark message as read.",
      );
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(messageId) {
    if (!window.confirm("Delete this message?")) return;

    setBusyId(messageId);
    setError("");
    setNotice("");
    try {
      await deleteMessage(messageId);
      setMessages((currentMessages) =>
        currentMessages.filter((message) => message._id !== messageId),
      );
      setNotice("Message deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message || "Unable to delete message.",
      );
    } finally {
      setBusyId(null);
    }
  }

  const unreadCount = messages.filter((message) => !message.isRead).length;

  return (
    <main className="min-h-[calc(100vh-72px)] bg-[#f4f6f9] px-5 py-8 text-[#333333] md:px-8">
      <title>Messages | Kannangara Hardwares</title>
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-night-sky-300">
              Customer communication
            </p>
            <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-night-sky-500">
              Messages
            </h1>
            <p className="mt-2 text-sm text-[#8c8c8c]">
              Review questions and requests sent by customers.
            </p>
          </div>
          <div className="rounded-xl bg-white px-4 py-3 text-right shadow-[0_4px_12px_rgba(0,0,0,0.03)]">
            <p className="text-xs font-medium text-[#8c8c8c]">Unread</p>
            <p className="mt-1 text-2xl font-bold text-night-sky-500">
              {unreadCount}
            </p>
          </div>
        </header>

        {(error || notice) && (
          <div
            className={`rounded-xl border px-4 py-3 text-sm ${
              error
                ? "border-[#fecaca] bg-[#fff1f2] text-[#b91c1c]"
                : "border-[#bbf7d0] bg-[#f0fdf4] text-[#15803d]"
            }`}
            role="status"
          >
            {error || notice}
          </div>
        )}

        <section className="rounded-2xl bg-white p-5 shadow-[0_4px_12px_rgba(0,0,0,0.03)] md:p-6">
          {isLoading ? (
            <p className="py-12 text-center text-sm text-[#8c8c8c]">
              Loading messages...
            </p>
          ) : messages.length === 0 ? (
            <p className="py-12 text-center text-sm text-[#8c8c8c]">
              No customer messages yet.
            </p>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <article
                  key={message._id}
                  className={`border p-5 transition ${
                    message.isRead
                      ? "border-[#e5e7eb] bg-white"
                      : "border-night-sky-100 bg-[#f7f8fc]"
                  }`}
                >
                  <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <h2 className="text-lg font-bold text-night-sky-500">
                          {message.subject}
                        </h2>
                        {!message.isRead && (
                          <span className="rounded-full bg-night-sky-500 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
                            New
                          </span>
                        )}
                      </div>
                      <p className="mt-2 text-sm font-semibold text-[#333333]">
                        {message.name} · {message.email}
                      </p>
                      <p className="mt-1 text-xs text-[#8c8c8c]">
                        {formatDate(message.createdAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {!message.isRead && (
                        <button
                          type="button"
                          onClick={() => handleRead(message)}
                          disabled={busyId === message._id}
                          className="rounded-md border border-night-sky-500 px-3 py-2 text-xs font-bold text-night-sky-500 hover:bg-night-sky-500 hover:text-white disabled:opacity-50"
                        >
                          Mark as read
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(message._id)}
                        disabled={busyId === message._id}
                        className="rounded-md border border-red-200 px-3 py-2 text-xs font-bold text-red-700 hover:bg-red-700 hover:text-white disabled:opacity-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  <p className="mt-4 whitespace-pre-wrap border-t border-[#e5e7eb] pt-4 text-sm leading-7 text-[#555555]">
                    {message.message}
                  </p>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default Messages;
