import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Delivery from "./pages/admin/Delivery";
import Order from "./pages/admin/Order";
import OrderDetails from "./pages/admin/OrderDetails";
import Supplier from "./pages/admin/Supplier";
import Dashboard from "./pages/admin/Dashboard";
import Expenses from "./pages/admin/Expenses";
import Employee from "./pages/admin/Employee";
import Inventory from "./pages/admin/Inventory";
import ProductForm from "./pages/admin/ProductForm";
import ProtectedRoute from "./components/ProtectedRoute";
import RenderNavbar from "./components/RenderNavbar";
import Unauthorized from "./pages/Unauthorized";
import { products } from "./utility/products";
import { getCart } from "./api/cart";
import { useEffect, useState } from "react";

const emptyCart = {items:[]};

function normalizeCart(cartResponse) {
  if (Array.isArray(cartResponse)) {
    return { items: cartResponse };
  }

  return cartResponse?.items ? cartResponse : emptyCart;
}

function App() {
  const [cart, setCart] = useState(emptyCart);
  const location = useLocation();
  const isLoggedIn = window.localStorage.getItem("loggedIn");

  useEffect(() => {
    if (!window.localStorage.getItem("token")) {
      return;
    }

    async function loadCart() {
      try {
        const existingCart = await getCart();
        setCart(normalizeCart(existingCart));
      } catch (error) {
        console.error("Unable to load cart", error);
        setCart(emptyCart);
      }
    }

    loadCart();
  });

  const user = (() => {
    try {
      return JSON.parse(window.localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <RenderNavbar cart={cart} />}
      <Routes>
        {!isLoggedIn && (
          <>
            <Route path="/login" element={<SignIn />} />
            <Route path="/register" element={<SignUp />} />
            <Route
              path="/"
              element={
                <Home products={products} cart={cart} setCart={setCart} />
              }
            />
          </>
        )}
        {/* ProtectedRoutes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/login" element={<Navigate to="/" />} />
          <Route path="/register" element={<Navigate to="/" />} />
          {(user?.isAdmin || user?.isMannager || user?.isCashier) && (
            <Route path="/inventory" element={<Inventory />} />
          )}
          {user?.isAdmin || user?.isMannager ? (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/inventory/new" element={<ProductForm />} />
              <Route path="/inventory/:productID/edit" element={<ProductForm />} />
              <Route path="/expenses" element={<Expenses />} />
              <Route path="/orders" element={<Order />} />
              <Route path="/orders/:orderID" element={<OrderDetails />} />
              <Route path="/delivery" element={<Delivery />} />
              <Route path="/suppliers" element={<Supplier />} />
              {user?.isMannager && <Route path="/employees" element={<Employee />} />}
            </>
          ) : (
            <>
              <Route
                path="/"
                element={
                  <Home products={products} cart={cart} setCart={setCart} />
                }
              />
              <Route path="/profile" element={<Profile />} />
              <Route
                path="/cart"
                element={<Cart cart={cart} setCart={setCart} />}
              />
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
