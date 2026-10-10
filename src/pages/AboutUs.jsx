import { Link } from "react-router";
import Footer from "../components/Footer";

function AboutUs() {
  return (
    <main className="w-full bg-slate-50">
      <title>About Us | Kannangara Hardwares</title>

      <section className="bg-night-sky-500 px-6 py-16 text-white sm:px-10 lg:px-16 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-slate-300 sm:text-sm">
            Who we are
          </p>
          <h1 className="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl">
            Building trust since 2004.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-200 sm:text-lg">
            Kannangara Enterprises Pvt Ltd has been serving Sri Lanka with
            quality hardware and grocery supplies for over two decades. We are
            proud to be your trusted neighbourhood store.
          </p>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-12 sm:px-10 lg:grid-cols-[0.85fr_1.4fr] lg:gap-16 lg:px-16 lg:py-16">
        <div>
          <h2 className="text-2xl font-bold text-night-sky-500 sm:text-3xl">
            Our story
          </h2>
          <p className="mt-4 leading-7 text-slate-600">
            Founded in 2004, Kannangara Enterprises Pvt Ltd started as a small
            hardware outlet with a mission to provide reliable tools and
            materials to our local community. Over the years we have grown into
            a full-service hardware and grocery store, stocking everything from
            hand tools to household essentials.
          </p>

          <div className="mt-8 space-y-6 text-sm text-slate-700">
            <div className="border-l-4 border-night-sky-500 pl-4">
              <h3 className="font-bold text-night-sky-500">Established</h3>
              <p className="mt-1 leading-6">
                2004
                <br />
                Kannangara Enterprises Pvt Ltd
              </p>
            </div>
            <div className="border-l-4 border-night-sky-500 pl-4">
              <h3 className="font-bold text-night-sky-500">What we offer</h3>
              <p className="mt-1 leading-6">
                Hardware supplies
                <br />
                Grocery essentials
              </p>
            </div>
            <div className="border-l-4 border-night-sky-500 pl-4">
              <h3 className="font-bold text-night-sky-500">Our location</h3>
              <p className="mt-1 leading-6">Sri Lanka</p>
            </div>
          </div>

          <Link
            to="/"
            className="mt-9 inline-flex items-center gap-2 text-sm font-bold text-night-sky-500 hover:text-night-sky-300"
          >
            <span aria-hidden="true">&lt;-</span> Back to shopping
          </Link>
        </div>

        <div className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <h2 className="text-2xl font-bold text-night-sky-500">
            Why choose us?
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            More than 20 years of dedication to quality and customer
            satisfaction.
          </p>

          <div className="mt-7 space-y-6">
            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-night-sky-500 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-night-sky-500">
                  Trusted since 2004
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Two decades of experience serving homes and businesses across
                  Sri Lanka with hardware and grocery products you can rely on.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-night-sky-500 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-night-sky-500">
                  Community first
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  We are a family-run business deeply rooted in our local
                  community. Every purchase you make supports the people and
                  families behind our store.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-night-sky-500 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 2a4 4 0 00-4 4v1H5a1 1 0 00-.994.89l-1 9A1 1 0 004 18h12a1 1 0 00.994-1.11l-1-9A1 1 0 0015 7h-1V6a4 4 0 00-4-4zm2 5V6a2 2 0 10-4 0v1h4zm-6 3a1 1 0 112 0 1 1 0 01-2 0zm7-1a1 1 0 100 2 1 1 0 000-2z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-night-sky-500">
                  Wide product range
                </h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  From hand tools and power equipment to everyday grocery
                  staples — we stock what you need so you don&apos;t have to
                  shop around.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-md bg-night-sky-500 text-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-night-sky-500">Expert advice</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">
                  Our knowledgeable staff are always ready to help you choose
                  the right product for the job — whether you&apos;re a
                  professional contractor or a first-time DIYer.
                </p>
              </div>
            </div>
          </div>

          <Link
            to="/contact"
            className="mt-8 inline-block rounded-md bg-night-sky-500 px-5 py-3 font-bold text-white transition hover:bg-night-sky-300 focus:outline-none focus:ring-4 focus:ring-night-sky-500/20"
          >
            Get in touch
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}

export default AboutUs;
