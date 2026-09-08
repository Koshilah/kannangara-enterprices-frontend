function Form({
  title,
  handleSubmit,
  handleKeyUp,
  inputs,
  setInputs,
  formElements,
  errorState,
  systemError
}) {
  let accountStatusText = (
    <p className="text-sm">
      Already have an account?
      <span className="text-blue-700 cursor-pointer hover:text-blue-950">
        {" "}
        Sign In
      </span>
    </p>
  );
  if (title === "Sign In") {
    accountStatusText = (
      <p className="text-sm">
        Don't have an account?
        <span className="text-blue-700 cursor-pointer hover:text-blue-950">
          {" "}
          Sign Up
        </span>
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col px-3 pb-0 pt-4 mt-4 items-center min-w-xs max-w-lg mx-auto"
    >
      <p className="text-center text-3xl font-bold mb-4">{title}</p>
      {systemError && <button className="border py-3 w-full bg-red-300 border-red-500 rounded-xl mb-1.5">{systemError}</button>}
      {formElements.map((element) => (
        <div key={element.label} className="w-full mb-2.5">
          <label htmlFor={element.label} className="block mb-1 text-sm">
            {element.label}
          </label>
          <input
            type={element.type}
            id={element.label}
            name={element.name}
            value={inputs[element.name]}
            placeholder={element.placeholder}
            className="border-solid border w-full px-3 py-2 rounded-md sm:rounded-sm mb-0.5"
            onChange={(event) =>
              setInputs({ ...inputs, [element.name]: event.target.value })
            }
            onKeyUp={() => handleKeyUp(element.name)}
          />
          {}
          {errorState[element.name] && element.name === "password" && (
            <p
              className={
                errorState.password &&
                errorState.password === "Password is Strong"
                  ? "text-sm/tight text-green-600"
                  : "text-sm/tight text-red-600"
              }
            >
              {errorState[element.name]}
            </p>
          )}
          {errorState[element.name] && element.name != "password" && (
            <p className="text-sm/tight text-red-600">
              {errorState[element.name]}
            </p>
          )}
        </div>
      ))}
      <button
        type="submit"
        className="rounded-xl bg-night-sky-500 text-white font-bold w-[80%] mt-3 mb-3 p-3.5 mx-auto text-lg/7 tracking-wide cursor-pointer hover:bg-night-sky-400"
      >
        {title}
      </button>
      {title === "Sign In" && (
        <p className="text-sm cursor-pointer text-blue-700 mb-2 hover:text-blue-900 ">
          Forgot Password?
        </p>
      )}
      {accountStatusText}
    </form>
  );
}

export default Form;
