import Navbar from "./Navbar";
import NavbarAdmin from "./NavbarAdmin";

function RenderNavbar({cart}) {
  const isLoggedIn = window.localStorage.getItem("loggedIn") === "true";
  let user;

  try {
    user = JSON.parse(window.localStorage.getItem("user") || "null");
  } catch {
    return <Navbar cart={cart} isLoggedIn={isLoggedIn} user={null} />;
  }

  if (isLoggedIn && (user?.isAdmin || user?.isMannager)) {
    return <NavbarAdmin user={user}/>;
  }

  return <Navbar cart={cart} isLoggedIn={isLoggedIn} user={user} />;
}

export default RenderNavbar;
