import { Navigate, Outlet } from "react-router";

function ProtectedRoute() {
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  return isLoggedIn === "true" ? <Outlet /> : <Navigate to="login" />;
}

export default ProtectedRoute;
