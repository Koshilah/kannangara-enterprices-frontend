import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Form from "../components/Form";

function SignIn() {
  const [inputs, setInputs] = useState({ email: "", password: "" });

  const [errors, setErrors] = useState({ email: "", password: "" });

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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "" });
  };
  return (
    <AuthLayout layoutFor={"Sign In"}>
      <Form
        title={"Sign In"}
        formElements={formElements}
        inputs={inputs}
        setInputs={setInputs}
        errorState={errors}
        handleSubmit={handleSubmit}
      />
    </AuthLayout>
  );
}

export default SignIn;
