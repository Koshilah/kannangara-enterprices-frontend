import { useState } from "react";
import { Link, useNavigate } from "react-router";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import {
  isValidEmail,
  isStrongPassword,
  isPasswordMatched,
} from "../utility/inputValidation";
import { verifyEmail, resetPassword } from "../api/auth";

function ResetPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [inputs, setInputs] = useState({
    email: "",
    password: "",
    rePassword: "",
  });

  const [errors, setErrors] = useState({
    email: "",
    password: "",
    rePassword: "",
  });

  const [systemError, setSystemError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleKeyUp = (field) => {
    if (field === "password") {
      setErrors((prev) => ({
        ...prev,
        password: isStrongPassword(inputs.password),
      }));
    } else if (field === "rePassword") {
      setErrors((prev) => ({
        ...prev,
        rePassword: isPasswordMatched(inputs.password, inputs.rePassword)
          ? ""
          : "Password doesn't Match!",
      }));
    }
  };

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setSystemError("");
    setErrors({ email: "", password: "", rePassword: "" });

    if (!isValidEmail(inputs.email)) {
      setErrors((prev) => ({ ...prev, email: "Enter a valid Email!" }));
      return;
    }

    setIsSubmitting(true);
    try {
      await verifyEmail(inputs.email);
      setStep(2);
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        setSystemError("Something went wrong. Please try again.");
        return;
      }

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400 || status === 404) {
        setSystemError(message || "No account found with this email.");
      } else if (status >= 500) {
        setSystemError("The server is unavailable. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        setSystemError("Unable to connect to the server. Please try again.");
      } else {
        setSystemError(message || error.message || "Failed to verify email.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSystemError("");

    const strength = isStrongPassword(inputs.password);
    if (strength !== "Password is Strong") {
      setErrors((prev) => ({
        ...prev,
        password:
          "Use a valid password with at least 8 characters, including uppercase, lowercase, number, and symbol.",
      }));
      return;
    }

    if (!isPasswordMatched(inputs.password, inputs.rePassword)) {
      setErrors((prev) => ({
        ...prev,
        rePassword: "Password doesn't Match!",
      }));
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword({
        email: inputs.email,
        password: inputs.password,
      });

      navigate("/login", {
        state: {
          successMessage:
            "Password updated successfully. Please sign in with your new password.",
        },
      });
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        setSystemError("Something went wrong. Please try again.");
        return;
      }

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400 || status === 404) {
        setSystemError(message || "Unable to reset password.");
      } else if (status >= 500) {
        setSystemError("The server is unavailable. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        setSystemError("Unable to connect to the server. Please try again.");
      } else {
        setSystemError(message || error.message || "Failed to reset password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout layoutFor="Reset Password">
      <title>Reset Password | Kannangara Hardwares</title>

      {step === 1 ? (
        <form
          onSubmit={handleEmailSubmit}
          className="flex flex-col px-3 pb-0 pt-4 mt-4 items-center min-w-xs max-w-lg mx-auto"
        >
          <p className="text-center text-3xl font-bold mb-4">Reset Password</p>

          {systemError && (
            <button
              type="button"
              className="border py-3 w-full bg-red-300 border-red-500 rounded-xl mb-1.5 text-center text-sm font-medium"
            >
              {systemError}
            </button>
          )}

          <div className="w-full mb-2.5">
            <label htmlFor="Email" className="block mb-1 text-sm">
              Email
            </label>
            <input
              type="email"
              id="Email"
              name="email"
              value={inputs.email}
              placeholder="john@doe.com"
              className="border-solid border w-full px-3 py-2 rounded-md sm:rounded-sm mb-0.5"
              onChange={(e) =>
                setInputs({ ...inputs, email: e.target.value })
              }
            />
            {errors.email && (
              <p className="text-sm/tight text-red-600">{errors.email}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-night-sky-500 text-white font-bold w-[80%] mt-3 mb-3 p-3.5 mx-auto text-lg/7 tracking-wide cursor-pointer hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && (
              <span
                aria-hidden="true"
                className="mr-2 inline-block size-5 animate-spin rounded-full border-2 border-white border-t-transparent align-[-0.2em]"
              />
            )}
            <span>{isSubmitting ? "Checking Email..." : "Next"}</span>
          </button>

          <p className="text-sm">
            Remember your password?
            <Link to="/login">
              <span className="text-blue-700 cursor-pointer hover:text-blue-950">
                {" "}
                Sign In
              </span>
            </Link>
          </p>
        </form>
      ) : (
        <form
          onSubmit={handlePasswordSubmit}
          className="flex flex-col px-3 pb-0 pt-4 mt-4 items-center min-w-xs max-w-lg mx-auto"
        >
          <p className="text-center text-3xl font-bold mb-3">Reset Password</p>

          <div className="w-full flex items-center justify-between bg-gray-100 border border-gray-300 px-3 py-2 rounded-md mb-3 text-sm text-gray-700">
            <span className="truncate">
              Email: <strong className="text-night-sky-500">{inputs.email}</strong>
            </span>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setSystemError("");
                setErrors({ email: "", password: "", rePassword: "" });
              }}
              className="text-xs text-blue-700 hover:text-blue-950 cursor-pointer font-medium ml-2 shrink-0 underline"
            >
              Change
            </button>
          </div>

          {systemError && (
            <button
              type="button"
              className="border py-3 w-full bg-red-300 border-red-500 rounded-xl mb-1.5 text-center text-sm font-medium"
            >
              {systemError}
            </button>
          )}

          <div className="w-full mb-2.5">
            <label htmlFor="Password" className="block mb-1 text-sm">
              New Password
            </label>
            <input
              type="password"
              id="Password"
              name="password"
              value={inputs.password}
              placeholder=""
              className="border-solid border w-full px-3 py-2 rounded-md sm:rounded-sm mb-0.5"
              onChange={(e) =>
                setInputs({ ...inputs, password: e.target.value })
              }
              onKeyUp={() => handleKeyUp("password")}
            />
            {errors.password && (
              <p
                className={
                  errors.password === "Password is Strong"
                    ? "text-sm/tight text-green-600"
                    : "text-sm/tight text-red-600"
                }
              >
                {errors.password}
              </p>
            )}
          </div>

          <div className="w-full mb-2.5">
            <label htmlFor="rePassword" className="block mb-1 text-sm">
              Confirm New Password
            </label>
            <input
              type="password"
              id="rePassword"
              name="rePassword"
              value={inputs.rePassword}
              placeholder=""
              className="border-solid border w-full px-3 py-2 rounded-md sm:rounded-sm mb-0.5"
              onChange={(e) =>
                setInputs({ ...inputs, rePassword: e.target.value })
              }
              onKeyUp={() => handleKeyUp("rePassword")}
            />
            {errors.rePassword && (
              <p className="text-sm/tight text-red-600">{errors.rePassword}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-xl bg-night-sky-500 text-white font-bold w-[80%] mt-3 mb-3 p-3.5 mx-auto text-lg/7 tracking-wide cursor-pointer hover:bg-night-sky-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting && (
              <span
                aria-hidden="true"
                className="mr-2 inline-block size-5 animate-spin rounded-full border-2 border-white border-t-transparent align-[-0.2em]"
              />
            )}
            <span>
              {isSubmitting ? "Updating Password..." : "Change Password"}
            </span>
          </button>

          <p className="text-sm">
            Remember your password?
            <Link to="/login">
              <span className="text-blue-700 cursor-pointer hover:text-blue-950">
                {" "}
                Sign In
              </span>
            </Link>
          </p>
        </form>
      )}
    </AuthLayout>
  );
}

export default ResetPassword;
