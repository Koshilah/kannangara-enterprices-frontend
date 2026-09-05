import { useState } from "react";

function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  return (
    <nav className="px-5 py-1 w-dvw flex justify-between items-center">
      <div className="flex gap-0.5 items-center cursor-pointer">
        <img src="/logo.png" alt="logo" className="size-14" />
        <div className="">
          <p className="text-night-sky-500 font-bold text-xl leading-none">
            Kannangara
          </p>
          <p className="leading-none">Hardwares</p>
        </div>
      </div>
      <ul className="hidden md:flex gap-10 font-semibold" id="nav-links">
        <li className="cursor-pointer  hover:text-night-sky-500 hover:font-bold">
          Home
        </li>
        <li className="cursor-pointer hover:text-night-sky-500 hover:font-bold">
          Deals
        </li>
        <li className="cursor-pointer hover:text-night-sky-500 hover:font-bold">
          About Us
        </li>
        <li className="cursor-pointer hover:text-night-sky-500 hover:font-bold">
          Contact Us
        </li>
      </ul>
      <div className="flex gap-5 items-center">
        <div className="cursor-pointer">
          <img src="cart.png" alt="cart" className="size-9 inline" />
          <p className="inline px-1 py-1 text-xl font-semibold box-border">0</p>
        </div>
        {isLoggedIn ? (
          <div className="relative group" id="profile-section">
            <button
              type="button"
              className="flex items-center gap-0.5 cursor-pointer"
              aria-label="Open profile menu"
            >
              <img src="profile.png" alt="profile" className="size-10" />
              <img src="expand-down.png" alt="expand down" className="size-4" />
            </button>
            <div className="absolute right-0 top-full z-10 hidden w-64 pt-3 group-hover:block group-focus-within:block">
              <div className="border border-neutral-300 bg-white px-6 py-4 shadow-lg">
                <p className="text-xl font-semibold">Hi, Kasun Perera</p>
                <hr className="my-3 border-neutral-400" />
                <ul className="space-y-2 text-md">
                  <li className="cursor-pointer hover:text-night-sky-500 hover:font-semibold">
                    My Profile
                  </li>
                  <li className="cursor-pointer  hover:text-night-sky-500 hover:font-semibold">
                    Cart
                  </li>
                  <li className="cursor-pointer  hover:text-night-sky-500 hover:font-semibold">
                    Order History
                  </li>
                  <li className="cursor-pointer  hover:text-night-sky-500 hover:font-semibold">
                    Recent Transaction
                  </li>
                </ul>
                <hr className="my-4 border-neutral-400" />
                <button
                  type="button"
                  onClick={() => setIsLoggedIn(false)}
                  className="w-full rounded-xl border-2 border-red-600 py-2 text-lg font-semibold text-red-800 hover:bg-red-800 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsLoggedIn(true)}
            className="bg-night-sky-500 text-white font-semibold px-4 rounded-lg text-lg py-1.5 cursor-pointer hover:bg-night-sky-300"
          >
            Log In
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
