import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import AuthLayout from "../components/AuthLayout";
import Form from "../components/Form";
import {
  isValidEmail,
  isStrongPassword,
  isPasswordMatched,
} from "../utility/inputValidation";
import { register, saveToLocalStorage } from "../api/auth";

function SignUp() {
  const navigate = useNavigate();
  const [inputs, setInputs] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    rePassword: "",
  });

  const [systemError, setSystemError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formElements = [
    {
      label: "Name",
      name: "name",
      type: "text",
      placeholder: "John Doe",
    },
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
    {
      label: "Re-Enter Password",
      name: "rePassword",
      type: "password",
      placeholder: "",
    },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSystemError("");
    setErrors({
      name: "",
      email: "",
      password: "",
      rePassword: "",
    });
    if (!isValidEmail(inputs.email)) {
      setErrors({ ...errors, email: "Enter a valid Email!" });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await register({
        name: inputs.name,
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

  const handleKeyUp = (field) => {
    if (field == "password") {
      setErrors({ ...errors, password: isStrongPassword(inputs.password) });
    } else if (field == "rePassword") {
      setErrors({
        ...errors,
        rePassword: isPasswordMatched(inputs.password, inputs.rePassword)
          ? ""
          : "Password doesn't Match!",
      });
    }
  };
  return (
    <AuthLayout layoutFor={"Sign Up"}>
      <Form
        title={"Sign Up"}
        formElements={formElements}
        inputs={inputs}
        setInputs={setInputs}
        errorState={errors}
        handleSubmit={handleSubmit}
        handleKeyUp={handleKeyUp}
        systemError={systemError}
        isSubmitting={isSubmitting}
      />
    </AuthLayout>
  );
}

export default SignUp;
