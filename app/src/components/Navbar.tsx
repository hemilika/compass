import { Link } from "react-router-dom";
import { useTheme } from "../theme/ThemeProvider";

const Navbar = () => {
  const { mode, setMode } = useTheme();

  return (
    <nav className="w-full border-b border-zinc-200 bg-white/60 backdrop-blur dark:border-zinc-800 dark:bg-black/60">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-50"
          >
            Boilerplate
          </Link>
          <Link
            to="/login"
            className="text-sm text-zinc-700 hover:underline dark:text-zinc-300"
          >
            Login
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <button
            className={`rounded px-2 py-1 text-xs ${
              mode === "light" ? "bg-zinc-200 dark:bg-zinc-800" : ""
            }`}
            onClick={() => setMode("light")}
          >
            Light
          </button>
          <button
            className={`rounded px-2 py-1 text-xs ${
              mode === "dark" ? "bg-zinc-200 dark:bg-zinc-800" : ""
            }`}
            onClick={() => setMode("dark")}
          >
            Dark
          </button>
          <button
            className={`rounded px-2 py-1 text-xs ${
              mode === "system" ? "bg-zinc-200 dark:bg-zinc-800" : ""
            }`}
            onClick={() => setMode("system")}
          >
            System
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
