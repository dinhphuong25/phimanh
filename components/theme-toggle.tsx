"use client";

import { useEffect, useState } from "react";
import { useMaterialTheme } from "@/components/providers/material-theme-provider";
import { MaterialRipple } from "@/components/ui/material-animations";
import EnhancedButton from "@/components/ui/enhanced-button";
import { Sun, Moon } from "lucide-react";
import ClientOnly from "@/components/ui/client-only";

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useMaterialTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Always render the button, ClientOnly handles the interactive vs static parts
  const themeButton = (
    <MaterialRipple>
      <EnhancedButton
        variant="text"
        size="small"
        onClick={mounted ? toggleTheme : undefined}
        disabled={!mounted}
        className="w-10 h-10 rounded-full relative overflow-hidden group hover:bg-primary/10"
        suppressHydrationWarning
        icon={
          <div className="relative w-6 h-6">
            {/* Light mode icon */}
            <Sun
              className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
                (mounted && isDark)
                  ? 'rotate-90 scale-0 opacity-0'
                  : 'rotate-0 scale-100 opacity-100'
              } group-hover:rotate-12`}
            />
            {/* Dark mode icon */}
            <Moon
              className={`absolute inset-0 w-5 h-5 transition-all duration-500 ${
                (mounted && isDark)
                  ? 'rotate-0 scale-100 opacity-100'
                  : '-rotate-90 scale-0 opacity-0'
              } group-hover:-rotate-12`}
            />
          </div>
        }
      />
    </MaterialRipple>
  );

  return themeButton;
}
