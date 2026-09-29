import { Link } from "react-router";

function Footer() {
  return (
    <footer className="bg-night-sky-100 px-6 pb-4 pt-8 text-black md:px-14 md:pt-10">
      <div className="mx-auto grid max-w-7xl gap-7 text-center md:grid-cols-[1.1fr_2fr_0.9fr_1.3fr] md:items-start md:gap-8 md:text-left">
        <div className="flex flex-col items-center md:items-start">
          <img
            src="/logo.png"
            alt="Kannangara Hardwares logo"
            className="h-24 w-24 object-contain"
          />
          <h2 className="mt-2 text-2xl font-bold leading-tight text-white">
            Kannangara
            <br />
            Hardwares
          </h2>
        </div>

        <p className="mx-auto max-w-md text-sm leading-6 md:mt-2 md:text-center">
          Kannangara Enterprises is a trusted hardware store offering quality
          tools, building materials, electrical supplies, plumbing products, and
          everyday essentials for construction and home improvement. We are
          committed to providing reliable products, friendly service, and great
          value to help customers get every project done right.
        </p>

        <div className="md:mt-2">
          <h3 className="mb-3 text-lg font-bold text-white">Links</h3>
          <nav aria-label="Footer navigation">
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#home" className="hover:text-white">
                  Home
                </a>
              </li>
              <li>
                <a href="#deals" className="hover:text-white">
                  Deals
                </a>
              </li>
              <li>
                <Link to="/contact" className="hover:text-white">
                  Contact Us
                </Link>
              </li>
              <li>
                <a href="#about" className="hover:text-white">
                  About Us
                </a>
              </li>
            </ul>
          </nav>
        </div>

        <div className="md:mt-2">
          <h3 className="mb-3 text-lg font-bold text-white">
            Follow Us on Socials
          </h3>
          <div className="space-y-3 text-sm">
            <a
              href="#facebook"
              className="flex items-center justify-center gap-5 hover:text-white md:justify-start"
            >
              <span
                aria-hidden="true"
                className="text-2xl font-bold leading-none"
              >
                f
              </span>
              <span>
                Kannangara
                <br />
                Enterprises
              </span>
            </a>
            <a
              href="#instagram"
              className="flex items-center justify-center gap-5 hover:text-white md:justify-start"
            >
              <span
                aria-hidden="true"
                className="flex h-6 w-6 items-center justify-center rounded-lg border-2 border-current text-lg leading-none"
              >
                •
              </span>
              <span>
                Kannangara
                <br />
                Enterprises
              </span>
            </a>
          </div>
        </div>
      </div>

      <p className="mt-8 text-center text-xs">2026 - All Rights Reserved</p>
    </footer>
  );
}

export default Footer;
