import { useState } from "react";
import AuthLayout from "../components/AuthLayout";
import Form from "../components/Form";
import { isValidEmail, isStrongPassword, isPasswordMatched } from "../utility/inputValidation";

function SignUp() {
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

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrors({
      name: "",
      email: "",
      password: "",
      rePassword: "",
    });
    if(!isValidEmail(inputs.email)){
        setErrors({...errors, email: "Enter a valid Email!"})
        return;
    }
    
  };

  const handleKeyUp = (field) => {
    if(field == "password"){
        setErrors({...errors, password: isStrongPassword(inputs.password)})
    }
    else if(field == "rePassword"){
        setErrors({...errors, rePassword: isPasswordMatched(inputs.password, inputs.rePassword) ? "" :"Password doesn't Match!"})
    }
  }
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
      />
    </AuthLayout>
  );
}

export default SignUp;
