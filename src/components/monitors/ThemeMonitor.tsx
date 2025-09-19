import { useEffect } from "react";
import { useMantineTheme } from "@mantine/core";

const ThemeMonitor = (): null => {
  const { primaryColor, colors } = useMantineTheme();

  useEffect(() => {
    const root: HTMLElement = document.querySelector(":root")!;
    colors[primaryColor].forEach((shade, index) => {
      root.style.setProperty(`--mantine-color-primary-${index}`, shade);
    });
  }, [primaryColor, colors]);

  return null;
};

export default ThemeMonitor;
