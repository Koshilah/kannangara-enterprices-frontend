import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AuthLayout from "../components/AuthLayout";
import Form from "../components/Form";
import axios from "axios";
import { isValidEmail } from "../utility/inputValidation";
import { login, saveToLocalStorage } from "../api/auth";

function SignIn() {
  const location = useLocation();
  const [inputs, setInputs] = useState({ email: "", password: "" });

  const [errors, setErrors] = useState({ email: "", password: "" });

  const [systemError, setSystemError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || "",
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const formElements = [
    {
      label: "Email",
      name: "email",
      type: "email",
      placeholder: "john@doe.com",
    },
    {
      label: "Password",
      name: "password",
      type: "password",
      placeholder: "",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSystemError("");
    setSuccessMessage("");
    setErrors({ email: "", password: "" });

    if (!isValidEmail(inputs.email)) {
      setErrors({ ...errors, email: "Enter a valid Email!" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await login({
        email: inputs.email,
        password: inputs.password,
      });
      saveToLocalStorage(response.token, response.user);
      navigate("/");
      
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        setSystemError("Something went wrong. Please try again.");
        return;
      }

      const status = error.response?.status;
      const message = error.response?.data?.message;

      if (status === 400) {
        setSystemError(message);
      } else if (status >= 500) {
        setSystemError("The server is unavailable. Please try again later.");
      } else if (error.code === "ERR_NETWORK") {
        setSystemError("Unable to connect to the server. Please try again.");
      } else {
        setSystemError(message || error.message || "Registration failed.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <AuthLayout layoutFor={"Sign In"}>
      <title>Log In | Kannangara Hardwares</title>
      {successMessage && (
        <div className="max-w-lg mx-auto mt-4 px-3">
          <div className="border py-3 px-4 w-full bg-green-100 border-green-500 text-green-800 rounded-xl text-center text-sm font-medium">
            {successMessage}
          </div>
        </div>
      )}
      <Form
        title={"Sign In"}
        formElements={formElements}
        inputs={inputs}
        setInputs={setInputs}
        errorState={errors}
        handleSubmit={handleSubmit}
        systemError={systemError}
        isSubmitting={isSubmitting}
      />
    </AuthLayout>
  );
}

export default SignIn;
