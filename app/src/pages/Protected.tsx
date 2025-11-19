import { useAuth } from "../hooks/use-auth";
import { useNavigate } from "@tanstack/react-router";

const ProtectedPage = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  return (
    <div className="mx-auto max-w-3xl p-6">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
        Protected
      </h1>
      <p className="mt-2 text-zinc-700 dark:text-zinc-300">
        You can see this because you are authenticated.
      </p>
      <button
        className="mt-4 rounded bg-zinc-900 px-4 py-2 text-white dark:bg-zinc-200 dark:text-black"
        onClick={() => {
          logout();
          navigate({ to: "/login" });
        }}
      >
        Logout
      </button>
    </div>
  );
};

export default ProtectedPage;
