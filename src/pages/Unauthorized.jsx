import { Link } from "react-router";

function Unauthorized() {
  return (
    <main className="flex w-dvw h-dvh  flex-col items-center justify-center px-6 text-center">
      <h1 className="mt-2 text-3xl font-bold">
        404 Not Found!
      </h1>
      <Link
        to="/"
        className="mt-6 rounded-md bg-night-sky-500 px-5 py-3 font-semibold text-white"
      >
        Return home
      </Link>
    </main>
  );
}

export default Unauthorized;
