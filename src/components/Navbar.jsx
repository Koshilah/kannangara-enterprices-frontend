import { Link, NavLink, useNavigate } from "react-router";
import { logout } from "../api/auth";

function Navbar({ isLoggedIn, user, cart }) {
  const navigate = useNavigate();
  const navLinkClass = ({ isActive }) =>
    `inline-block cursor-pointer hover:text-night-sky-500 hover:font-bold ${
      isActive ? "border-b-2 border-night-sky-500 pb-1 text-night-sky-500" : ""
    }`;

  return (
    <nav className="fixed inset-x-0 top-0 z-50 flex h-16 w-full items-center justify-between bg-white px-5 py-1 shadow-sm">
      <div className="flex gap-0.5 items-center cursor-pointer">
        <img src="/logo.png" alt="logo" className="size-14" />
        <div className="">
          <p className="text-night-sky-500 font-bold text-xl tracking-wide leading-none">
            Kannangara
          </p>
          <p className="leading-none">Hardwares</p>
        </div>
      </div>
      <ul className="hidden md:flex gap-10 font-semibold" id="nav-links">
        <li>
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
        </li>
        <li>
          <NavLink to="/deals" className={navLinkClass}>
            Deals
          </NavLink>
        </li>
        <li className="cursor-pointer hover:text-night-sky-500 hover:font-bold">
          About Us
        </li>
        <li className="cursor-pointer hover:text-night-sky-500 hover:font-bold">
          Contact Us
        </li>
      </ul>
      <div className="flex gap-5 items-center">
        <Link to={"/cart"}>
          <div className="cursor-pointer">
            <img src="cart.png" alt="cart" className="size-9 inline" />
            <p className="inline px-1 py-1 text-xl font-semibold box-border">
              {cart.items.length}
            </p>
          </div>
        </Link>
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
                <p className="text-xl font-semibold">Hi, {user?.name}</p>
                <hr className="my-3 border-neutral-400" />
                <ul className="space-y-2 text-md">
                  <Link to={"/profile"}>
                    <li className="cursor-pointer hover:text-night-sky-500 hover:font-semibold">
                      My Profile
                    </li>
                  </Link>
                  <Link to={"/cart"}>
                    <li className="cursor-pointer  hover:text-night-sky-500 hover:font-semibold">
                      Cart
                    </li>
                  </Link>
                  <Link to={'/my-orders'}><li className="cursor-pointer  hover:text-night-sky-500 hover:font-semibold">
                    Order History
                  </li></Link>
                  <li className="cursor-pointer  hover:text-night-sky-500 hover:font-semibold">
                    Recent Transaction
                  </li>
                </ul>
                <hr className="my-4 border-neutral-400" />
                <button
                  type="button"
                  onClick={() => {
                    logout();
                    navigate("/");
                    window.location.href = "/";
                  }}
                  className="w-full rounded-xl border-2 border-red-600 py-2 text-lg font-semibold text-red-800 hover:bg-red-800 hover:text-white"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        ) : (
          <Link to={"/login"}>
            <button
              type="button"
              onClick={() => {}}
              className="bg-night-sky-500 text-white font-semibold px-4 rounded-lg text-lg py-1.5 cursor-pointer hover:bg-night-sky-300"
            >
              Log In
            </button>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
