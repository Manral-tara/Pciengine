import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="group relative flex h-10 w-10 items-center justify-center rounded-lg border border-gray-200 bg-white transition-all hover:shadow-md dark:border-white/10 dark:bg-[#161A3A] dark:hover:border-[#4AFFA8]/30 dark:hover:shadow-[0_0_20px_rgba(74,255,168,0.15)]"
      aria-label="Toggle theme"
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <Moon className="h-5 w-5 text-gray-700 transition-transform group-hover:scale-110" />
      ) : (
        <Sun className="h-5 w-5 text-[#4AFFA8] transition-transform group-hover:scale-110 group-hover:text-[#9DF5E6]" />
      )}
      
      {/* Animated ring on hover */}
      <div className="absolute inset-0 rounded-lg opacity-0 transition-opacity group-hover:opacity-100">
        <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#4AFFA8]/10 to-[#2BBBEF]/10 dark:from-[#4AFFA8]/20 dark:to-[#9DF5E6]/20" />
      </div>
    </button>
  );
}
