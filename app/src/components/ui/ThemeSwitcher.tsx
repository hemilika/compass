import { useSelector, useDispatch } from "react-redux";
import { selectThemeMode, setThemeMode } from "../../features/theme/themeSlice";
import type { ThemeMode } from "../../features/theme/themeSlice";
import type { RootState } from "../../store";
import Button from "./Button";

const modes: { mode: ThemeMode; label: string; icon: string }[] = [
  { mode: "light", label: "Light", icon: "☀️" },
  { mode: "dark", label: "Dark", icon: "🌙" },
];

export const ThemeSwitcher = () => {
  const dispatch = useDispatch();
  const currentMode = useSelector((state: RootState) => selectThemeMode(state));

  return (
    <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-100 dark:bg-zinc-800">
      {modes.map((m) => (
        <Button
          key={m.mode}
          type="button"
          aria-label={m.label}
          variant={currentMode === m.mode ? "primary" : "ghost"}
          size="icon"
          className={`
            text-sm transition-all duration-200
            ${
              currentMode === m.mode
                ? "shadow-sm scale-105"
                : "hover:bg-zinc-200 dark:hover:bg-zinc-700"
            }
          `.trim()}
          onClick={() => dispatch(setThemeMode(m.mode))}
        >
          <span className="text-base">{m.icon}</span>
        </Button>
      ))}
    </div>
  );
};
