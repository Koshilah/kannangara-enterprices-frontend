import "./App.css";
import { Routes, Route, Navigate, useLocation } from "react-router";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Home from "./pages/Home";
import Deals from "./pages/Deals";
import Catalog from "./pages/Catalog";
import Profile from "./pages/Profile";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import MyOrders from "./pages/MyOrders";
import Delivery from "./pages/admin/Delivery";
import Order from "./pages/admin/Order";
import OrderDetails from "./pages/admin/OrderDetails";
import Supplier from "./pages/admin/Supplier";
import Dashboard from "./pages/admin/Dashboard";
import Expenses from "./pages/admin/Expenses";
import Employee from "./pages/admin/Employee";
import Inventory from "./pages/admin/Inventory";
import ProductForm from "./pages/admin/ProductForm";
import AdminProfile from "./pages/admin/Profile";
import ProtectedRoute from "./components/ProtectedRoute";
import RenderNavbar from "./components/RenderNavbar";
import Unauthorized from "./pages/Unauthorized";
import ContactUs from "./pages/ContactUs";
import Messages from "./pages/admin/Messages";
import HeroSlides from "./pages/admin/HeroSlides";
import { getProducts } from "./api/product";
import { getCategories } from "./api/category";
import { getCart } from "./api/cart";
import { useEffect, useState } from "react";

const emptyCart = { items: [] };

function normalizeCart(cartResponse) {
  if (Array.isArray(cartResponse)) {
    return { items: cartResponse };
  }

  return cartResponse?.items ? cartResponse : emptyCart;
}

function App() {
  const [cart, setCart] = useState(emptyCart);
  const [products, setProducts] = useState([]);
  const [categoryNames, setCategoryNames] = useState({});
  const [productsLoading, setProductsLoading] = useState(true);
  const location = useLocation();
  const isLoggedIn = window.localStorage.getItem("loggedIn");

  useEffect(() => {
    async function loadProducts() {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (error) {
        console.error("Unable to load products", error);
      } finally {
        setProductsLoading(false);
      }
    }

    loadProducts();
  }, []);

  useEffect(() => {
    async function loadCategories() {
      try {
        const categories = await getCategories();
        const names = {};

        categories.forEach((category) => {
          names[category._id] = category.name;

          (category.subCategories || []).forEach((subcategory) => {
            names[subcategory._id] = `${category.name} / ${subcategory.name}`;
          });
        });

        setCategoryNames(names);
      } catch (error) {
        console.error("Unable to load categories", error);
      }
    }

    loadCategories();
  }, []);

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

  const isAdmin = Boolean(user?.isAdmin);
  const isManager = Boolean(user?.isMannager);
  const isCashier = Boolean(user?.isCashier);
  const isAdminPanelUser = isAdmin || isManager || isCashier;

  const hideNavbar = ["/login", "/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <RenderNavbar cart={cart} />}
      <div className={hideNavbar ? "" : "pt-16"}>
        <Routes>
          {!isLoggedIn && (
            <>
              <Route path="/login" element={<SignIn />} />
              <Route path="/register" element={<SignUp />} />
              <Route
                path="/"
                element={
                  <Home
                    products={products}
                    loading={productsLoading}
                    cart={cart}
                    setCart={setCart}
                    categoryNames={categoryNames}
                  />
                }
              />
              <Route
                path="/deals"
                element={
                  <Deals
                    products={products}
                    loading={productsLoading}
                    cart={cart}
                    setCart={setCart}
                    categoryNames={categoryNames}
                  />
                }
              />
              <Route
                path="/catalog"
                element={
                  <Catalog
                    cart={cart}
                    setCart={setCart}
                    categoryNames={categoryNames}
                  />
                }
              />
            </>
          )}
          {/* ProtectedRoutes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/login" element={<Navigate to="/" />} />
            <Route path="/register" element={<Navigate to="/" />} />
            <Route
              path="/cart"
              element={
                <Cart cart={cart} setCart={setCart} products={products} />
              }
            />
            <Route
              path="/checkout"
              element={
                <Checkout cart={cart} setCart={setCart} products={products} />
              }
            />
            <Route path="/my-orders" element={<MyOrders />} />
            {isAdminPanelUser ? (
              <>
                <Route path="/inventory" element={<Inventory />} />
                {isManager && <Route path="/" element={<Dashboard />} />}
                {(isManager || isAdmin) && (
                  <>
                    <Route path="/inventory/new" element={<ProductForm />} />
                    <Route
                      path="/inventory/:productID/edit"
                      element={<ProductForm />}
                    />
                    <Route path="/expenses" element={<Expenses />} />
                    <Route path="/orders" element={<Order />} />
                    <Route path="/orders/:orderID" element={<OrderDetails />} />
                    <Route path="/delivery" element={<Delivery />} />
                    <Route path="/suppliers" element={<Supplier />} />
                    <Route path="/messages" element={<Messages />} />
                    <Route path="/hero-slides" element={<HeroSlides />} />
                    <Route path="/profile" element={<AdminProfile />} />
                  </>
                )}
                {isManager && (
                  <Route path="/employees" element={<Employee />} />
                )}
                {!isManager && (
                  <>
                    <Route
                      path="/"
                      element={<Navigate to="/inventory" replace />}
                    />
                    <Route path="/profile" element={<AdminProfile />} />
                  </>
                )}
              </>
            ) : (
              <>
                <Route
                  path="/"
                  element={
                    <Home
                      products={products}
                      loading={productsLoading}
                      cart={cart}
                      setCart={setCart}
                      categoryNames={categoryNames}
                    />
                  }
                />
                <Route path="/profile" element={<Profile />} />
                <Route
                  path="/deals"
                  element={
                    <Deals
                      products={products}
                      loading={productsLoading}
                      cart={cart}
                      setCart={setCart}
                      categoryNames={categoryNames}
                    />
                  }
                />
                <Route
                  path="/catalog"
                  element={
                    <Catalog
                      cart={cart}
                      setCart={setCart}
                      categoryNames={categoryNames}
                    />
                  }
                />
              </>
            )}
          </Route>

          <Route path="/contact" element={<ContactUs />} />
          <Route path="/about" element={null} />
          <Route path="*" element={<Unauthorized />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
