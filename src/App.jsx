import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Dashboard from "./pages/admin/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RenderNavbar from "./components/RenderNavbar";
import Unauthorized from "./pages/Unauthorized";

function App() {
  const location = useLocation();
  const isLoggedIn = window.localStorage.getItem("loggedIn");
  const user = window.localStorage.getItem("user");
  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <RenderNavbar />}
      <Routes>
        {!isLoggedIn && (
          <>
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />
            <Route path="/" element={<Home />} />
          </>
        )}
        {/* ProtectedRoutes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />
          {user?.isAdmin ? (
            <>
              <Route path="/" element={<Dashboard />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Home />} />
            </>
          )}
        </Route>

        <Route path="/about" element={null} />
        <Route path="*" element={<Unauthorized />} />
      </Routes>
    </>
  );
}

export default App;
