import { useMantineTheme } from "@mantine/core";
import { useEffect } from "react";

const Themer = (): null => {
  const { primaryColor, colors } = useMantineTheme();

  useEffect(() => {
    const root = document.querySelector(":root")! as HTMLElement;
    colors[primaryColor].forEach((shade, index) => {
      root.style.setProperty(`--mantine-color-primary-${index}`, shade);
    });
  }, [primaryColor, colors]);

  return null;
};

export default Themer;
