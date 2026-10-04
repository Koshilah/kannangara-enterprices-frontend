function AuthLayout({ layoutFor, children }) {
  let title = "Let's Get Started!";
  let tagline = "Sign Up for better shopping experience";

  if (layoutFor === "Sign In") {
    title = "Welcome Back!";
    tagline = "Sign In for better shopping experience";
  } else if (layoutFor === "Reset Password") {
    title = "Reset Password";
    tagline = "Recover your account credentials";
  }
  return (
    <section className="h-dvh md:grid md:grid-cols-[1fr_1.5fr]">
      <div className="bg-night-sky-200 hidden md:flex justify-center items-center flex-col">
        <img src="/logo.png" alt="logo" className="size-50 " />
        <p className="text-white text-5xl text-center font-bold">Kannangara</p>
        <p className="text-black text-5xl text-center font-bold">Hardwares</p>
      </div>
      <div className=" px-7 py-5 pb-0">
        <div className="flex gap-0.5 items-center justify-center cursor-pointer md:hidden">
          <img src="/logo.png" alt="logo" className="size-14" />
          <div className="">
            <p className="text-night-sky-500 font-bold text-xl tracking-wide leading-none">
              Kannangara
            </p>
            <p className="leading-none">Hardwares</p>
          </div>
        </div>
        <div className="text-center mt-6 hidden md:block">
          <p className="text-3xl font-semibold text-night-sky-500">{title}</p>
          <p className="text-night-sky-300">{tagline}</p>
        </div>
        {children}
      </div>
    </section>
  );
}

export default AuthLayout;
