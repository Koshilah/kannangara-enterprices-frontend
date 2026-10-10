import { useState } from "react";
import { Link } from "react-router";
import Footer from "../components/Footer";
import { sendMessage } from "../api/message";

function isValidEmail(email) {
  return (
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

function getFieldError(name, value) {
  if (name === "name") {
    if (!value.trim()) return "Full name is required.";
  }
  if (name === "email") {
    if (!value.trim()) return "Email address is required.";
    if (!isValidEmail(value)) return "Please enter a valid email address.";
  }
  if (name === "message") {
    if (!value.trim()) return "Message is required.";
  }
  return "";
}

function FieldError({ message }) {
  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-500">
      <svg className="size-3.5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z"
          clipRule="evenodd"
        />
      </svg>
      {message}
    </p>
  );
}

function ContactForm({ form, isSending, error, notice, onChange, onSubmit }) {
  const [touched, setTouched] = useState({
    name: false,
    email: false,
    message: false,
  });

  const errors = {
    name: getFieldError("name", form.name),
    email: getFieldError("email", form.email),
    message: getFieldError("message", form.message),
  };

  const hasErrors = Object.values(errors).some(Boolean);

  function handleChange(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    onChange(event);
  }

  function handleBlur(event) {
    const { name } = event.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  }

  function handleSubmit(event) {
    setTouched({ name: true, email: true, message: true });
    if (hasErrors) {
      event.preventDefault();
      return;
    }
    onSubmit(event);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8"
    >
      <h2 className="text-2xl font-bold text-night-sky-500">
        Send us a message
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">
        Fill out the form and we&apos;ll get back to you soon.
      </p>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label
            htmlFor="contact-name"
            className="text-sm font-semibold text-slate-700"
          >
            Full name <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-name"
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="Your name"
            className={`mt-2 w-full rounded-md border px-4 py-3 font-normal outline-none transition focus:ring-2 ${
              touched.name && errors.name
                ? "border-red-400 focus:border-red-400 focus:ring-red-200/30"
                : "border-slate-300 focus:border-night-sky-500 focus:ring-night-sky-500/20"
            }`}
          />
          {touched.name && errors.name && <FieldError message={errors.name} />}
        </div>

        <div>
          <label
            htmlFor="contact-email"
            className="text-sm font-semibold text-slate-700"
          >
            Email address <span className="text-red-500">*</span>
          </label>
          <input
            id="contact-email"
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="you@example.com"
            className={`mt-2 w-full rounded-md border px-4 py-3 font-normal outline-none transition focus:ring-2 ${
              touched.email && errors.email
                ? "border-red-400 focus:border-red-400 focus:ring-red-200/30"
                : "border-slate-300 focus:border-night-sky-500 focus:ring-night-sky-500/20"
            }`}
          />
          {touched.email && errors.email && <FieldError message={errors.email} />}
        </div>
      </div>

      <label className="mt-5 block text-sm font-semibold text-slate-700">
        Subject
        <input
          type="text"
          name="subject"
          value={form.subject}
          onChange={onChange}
          placeholder="How can we help?"
          className="mt-2 w-full rounded-md border border-slate-300 px-4 py-3 font-normal outline-none transition focus:border-night-sky-500 focus:ring-2 focus:ring-night-sky-500/20"
        />
      </label>

      <div className="mt-5">
        <label
          htmlFor="contact-message"
          className="text-sm font-semibold text-slate-700"
        >
          Message <span className="text-red-500">*</span>
        </label>
        <textarea
          id="contact-message"
          name="message"
          value={form.message}
          onChange={handleChange}
          onBlur={handleBlur}
          rows="6"
          placeholder="Write your message here..."
          className={`mt-2 w-full resize-y rounded-md border px-4 py-3 font-normal outline-none transition focus:ring-2 ${
            touched.message && errors.message
              ? "border-red-400 focus:border-red-400 focus:ring-red-200/30"
              : "border-slate-300 focus:border-night-sky-500 focus:ring-night-sky-500/20"
          }`}
        />
        {touched.message && errors.message && <FieldError message={errors.message} />}
      </div>

      {(error || notice) && (
        <p
          className={`mt-5 text-sm ${error ? "text-red-700" : "text-green-700"}`}
          role="status"
        >
          {error || notice}
        </p>
      )}

      <button
        type="submit"
        disabled={isSending}
        className="mt-6 w-full rounded-md bg-night-sky-500 px-5 py-3 font-bold text-white transition hover:bg-night-sky-300 disabled:cursor-not-allowed disabled:opacity-60 focus:outline-none focus:ring-4 focus:ring-night-sky-500/20 sm:w-auto"
      >
        {isSending ? "Sending..." : "Send message"}
      </button>
    </form>
  );
}


function ContactUs() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [resetKey, setResetKey] = useState(0);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((currentForm) => ({ ...currentForm, [name]: value }));
    setError("");
    setNotice("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setNotice("");
    setIsSending(true);

    try {
      await sendMessage(form);
      setForm({ name: "", email: "", subject: "", message: "" });
      setResetKey((k) => k + 1); 
      setNotice("Your message has been sent successfully.");
    } catch (sendError) {
      setError(
        sendError.response?.data?.message ||
          "Unable to send your message. Please try again.",
      );
    } finally {
      setIsSending(false);
    }
  }

  return (
    <main className="w-full bg-slate-50">
      <title>Contact Us | Kannangara Hardwares</title>

      <section className="bg-night-sky-500 px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-300 sm:text-sm">
            We are here to help
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Let&apos;s talk about your next project.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
            Have a question about a product, an order, or finding the right
            supplies? Send us a message and our team will be happy to help.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16 lg:px-16 lg:py-16">
        <div>
          <h2 className="text-2xl font-bold text-night-sky-500 sm:text-3xl">
            Get in touch
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Visit us in store or reach out through any of the channels below. We
            look forward to helping you get the job done right.
          </p>

          <div className="mt-8 space-y-6 text-sm text-slate-700">
            <div className="border-l-4 border-night-sky-500 pl-4">
              <h3 className="font-bold text-night-sky-500">Visit our store</h3>
              <p className="mt-1 leading-6">
                Kannangara Enterprises
                <br />
                Sri Lanka
              </p>
            </div>
            <div className="border-l-4 border-night-sky-500 pl-4">
              <h3 className="font-bold text-night-sky-500">Call us</h3>
              <p className="mt-1 leading-6">
                047 226 2591
                <br />
                070 580 6000
              </p>
            </div>
            <div className="border-l-4 border-night-sky-500 pl-4">
              <h3 className="font-bold text-night-sky-500">Email us</h3>
              <p className="mt-1 break-all leading-6">
                kannangaraenterprises@gmail.com
              </p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-night-sky-500 hover:text-night-sky-300"
          >
            <span aria-hidden="true">&lt;-</span> Back to shopping
          </Link>
        </div>

        <ContactForm
          key={resetKey}
          form={form}
          isSending={isSending}
          error={error}
          notice={notice}
          onChange={handleChange}
          onSubmit={handleSubmit}
        />
      </section>

      <Footer />
    </main>
  );
}

export default ContactUs;
