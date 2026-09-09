import Navbar from "./Navbar";
import NavbarAdmin from "./NavbarAdmin";

function RenderNavbar({cart}) {
  const isLoggedIn = window.localStorage.getItem("loggedIn") === "true";
  let user = null;

  try {
    user = JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    user = null;
  }

  if (isLoggedIn && user?.isAdmin) {
    return <NavbarAdmin user={user}/>;
  }

  return <Navbar cart={cart} isLoggedIn={isLoggedIn} user={user} />;
}

export default RenderNavbar;
