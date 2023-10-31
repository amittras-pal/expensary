import { MantineColor, useMantineTheme } from "@mantine/core";
import React, { useEffect, useRef } from "react";
import "./Artwork.scss";

const barClasses = [".cls-10", ".cls-9", ".cls-6", ".cls-7", ".cls-8"];

export default function Artwork({ color }: { color: MantineColor }) {
  const ref = useRef<SVGSVGElement>(null);
  const { colors } = useMantineTheme();

  useEffect(() => {
    const svg = ref.current;
    const colorDots = svg?.querySelectorAll(".cls-5");
    const whiteDots = svg?.querySelectorAll(".cls-4");
    colorDots?.forEach((blinker, i) => {
      (blinker as HTMLElement).style.animationDelay = `${(i % 5) * 200}ms`;
    });
    whiteDots?.forEach((blinker, i) => {
      (blinker as HTMLElement).style.animationDelay = `${(i % 5) * 200}ms`;
    });

    const bars = barClasses.map((bar) => svg?.querySelector(bar));
    bars.forEach((bar, i) => {
      if (bar) (bar as HTMLElement).style.animationDelay = `${(i % 5) * 200}ms`;
    });
  }, []);

  useEffect(() => {
    const svg = ref.current;
    const colorDots = svg?.querySelectorAll(".cls-5") ?? [];
    const whiteDots = svg?.querySelectorAll(".cls-4") ?? [];

    colorDots?.forEach((dot) => {
      (dot as HTMLElement).style.fill = colors[color][5];
    });

    [...colorDots, ...whiteDots].forEach((dot) => {
      (dot as HTMLElement).style.animationPlayState =
        color === "red" ? "paused" : "running";
    });
  }, [color, colors]);

  return (
    <svg
      ref={ref}
      data-name="Layer 1"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1080 1080"
    >
      <rect className="cls-1" width="1080" height="1080" />
      <rect
        className="cls-2"
        x="257.7"
        y="476.3"
        width="604.85"
        height="497.94"
      />
      <rect
        className="cls-3"
        x="169.38"
        y="609.03"
        width="661.21"
        height="164.05"
      />
      <rect
        className="cls-2"
        x="198.74"
        y="642.82"
        width="130.19"
        height="20.03"
      />
      <rect
        className="cls-2"
        x="198.74"
        y="677.28"
        width="130.19"
        height="20.03"
      />
      <rect
        className="cls-2"
        x="198.74"
        y="712.92"
        width="130.19"
        height="20.03"
      />
      <path
        className="cls-2"
        d="M780.69,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,780.69,722.94Z"
      />
      <path
        className="cls-2"
        d="M747.74,722.94a7.47,7.47,0,1,1,7.47,7.46A7.46,7.46,0,0,1,747.74,722.94Z"
      />
      <path
        className="cls-2"
        d="M714.78,722.94a7.47,7.47,0,1,1,7.47,7.46A7.46,7.46,0,0,1,714.78,722.94Z"
      />
      <path
        className="cls-2"
        d="M681.82,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,681.82,722.94Z"
      />
      <path
        className="cls-2"
        d="M426.43,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,426.43,722.94Z"
      />
      <path
        className="cls-2"
        d="M392.82,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,392.82,722.94Z"
      />
      <path
        className="cls-2"
        d="M648.86,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,648.86,722.94Z"
      />
      <path
        className="cls-2"
        d="M487,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,487,722.94Z"
      />
      <path
        className="cls-4"
        d="M615.91,722.94a7.47,7.47,0,1,1,7.47,7.46A7.46,7.46,0,0,1,615.91,722.94Z"
      />
      <path
        className="cls-4"
        d="M583,722.94a7.47,7.47,0,1,1,7.47,7.46A7.46,7.46,0,0,1,583,722.94Z"
      />
      <path
        className="cls-4"
        d="M516.08,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,516.08,722.94Z"
      />
      <path
        className="cls-4"
        d="M365.48,722.94A7.47,7.47,0,1,1,373,730.4,7.46,7.46,0,0,1,365.48,722.94Z"
      />
      <path
        className="cls-5"
        d="M550,722.94a7.47,7.47,0,1,1,7.47,7.46A7.47,7.47,0,0,1,550,722.94Z"
      />
      <path
        className="cls-5"
        d="M455.63,722.94a7.47,7.47,0,1,1,7.47,7.46A7.46,7.46,0,0,1,455.63,722.94Z"
      />
      <path
        className="cls-2"
        d="M380.42,686.94a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,380.42,686.94Z"
      />
      <circle className="cls-2" cx="405.91" cy="686.94" r="7.47" />
      <path
        className="cls-2"
        d="M446.33,686.94a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,446.33,686.94Z"
      />
      <circle className="cls-2" cx="471.82" cy="686.94" r="7.47" />
      <circle className="cls-2" cx="727.21" cy="686.94" r="7.47" />
      <path
        className="cls-2"
        d="M768.29,686.94a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,768.29,686.94Z"
      />
      <path
        className="cls-2"
        d="M512.25,686.94a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,512.25,686.94Z"
      />
      <path
        className="cls-2"
        d="M674.1,686.94a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,674.1,686.94Z"
      />
      <path
        className="cls-4"
        d="M545.2,686.94a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,545.2,686.94Z"
      />
      <path
        className="cls-4"
        d="M578.16,686.94a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,578.16,686.94Z"
      />
      <path
        className="cls-4"
        d="M645,686.94a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,645,686.94Z"
      />
      <circle className="cls-4" cx="788.16" cy="686.94" r="7.47" />
      <path
        className="cls-5"
        d="M611.12,686.94a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,611.12,686.94Z"
      />
      <circle className="cls-5" cx="698.01" cy="686.94" r="7.47" />
      <circle className="cls-2" cx="788.16" cy="654.92" r="7.47" />
      <path
        className="cls-2"
        d="M747.74,654.92a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,747.74,654.92Z"
      />
      <circle className="cls-2" cx="722.25" cy="654.92" r="7.47" />
      <path
        className="cls-2"
        d="M681.82,654.92a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,681.82,654.92Z"
      />
      <path
        className="cls-2"
        d="M426.43,654.92a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,426.43,654.92Z"
      />
      <circle className="cls-2" cx="400.29" cy="654.92" r="7.47" />
      <circle className="cls-2" cx="656.33" cy="654.92" r="7.47" />
      <circle className="cls-2" cx="494.48" cy="654.92" r="7.47" />
      <path
        className="cls-4"
        d="M615.91,654.92a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,615.91,654.92Z"
      />
      <path
        className="cls-4"
        d="M583,654.92a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,583,654.92Z"
      />
      <circle className="cls-4" cx="523.55" cy="654.92" r="7.47" />
      <path
        className="cls-4"
        d="M365.48,654.92a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,365.48,654.92Z"
      />
      <circle className="cls-5" cx="557.46" cy="654.92" r="7.47" />
      <path
        className="cls-5"
        d="M455.63,654.92a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,455.63,654.92Z"
      />
      <rect
        className="cls-3"
        x="169.38"
        y="811.47"
        width="661.21"
        height="164.05"
      />
      <circle className="cls-2" cx="371.31" cy="855.73" r="7.47" />
      <path
        className="cls-2"
        d="M411.74,855.73a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,411.74,855.73Z"
      />
      <circle className="cls-2" cx="437.23" cy="855.73" r="7.47" />
      <path
        className="cls-2"
        d="M477.65,855.73a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,477.65,855.73Z"
      />
      <path
        className="cls-2"
        d="M733,855.73a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,733,855.73Z"
      />
      <circle className="cls-2" cx="759.18" cy="855.73" r="7.47" />
      <circle className="cls-2" cx="503.14" cy="855.73" r="7.47" />
      <circle className="cls-2" cx="664.99" cy="855.73" r="7.47" />
      <path
        className="cls-4"
        d="M543.57,855.73a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,543.57,855.73Z"
      />
      <circle className="cls-4" cx="569.05" cy="855.73" r="7.47" />
      <circle className="cls-4" cx="635.92" cy="855.73" r="7.47" />
      <path
        className="cls-4"
        d="M794,855.73a7.47,7.47,0,1,1-7.46-7.47A7.46,7.46,0,0,1,794,855.73Z"
      />
      <path
        className="cls-5"
        d="M609.48,855.73a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,609.48,855.73Z"
      />
      <path
        className="cls-5"
        d="M703.84,855.73a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,703.84,855.73Z"
      />
      <path
        className="cls-2"
        d="M779.06,891.73a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,779.06,891.73Z"
      />
      <path
        className="cls-2"
        d="M746.1,891.73a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,746.1,891.73Z"
      />
      <path
        className="cls-2"
        d="M713.14,891.73a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,713.14,891.73Z"
      />
      <path
        className="cls-2"
        d="M680.18,891.73a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,680.18,891.73Z"
      />
      <path
        className="cls-2"
        d="M424.79,891.73a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,424.79,891.73Z"
      />
      <path
        className="cls-2"
        d="M391.19,891.73a7.47,7.47,0,1,1,7.46,7.47A7.47,7.47,0,0,1,391.19,891.73Z"
      />
      <path
        className="cls-2"
        d="M647.23,891.73a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,647.23,891.73Z"
      />
      <path
        className="cls-2"
        d="M485.37,891.73a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,485.37,891.73Z"
      />
      <path
        className="cls-4"
        d="M614.27,891.73a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,614.27,891.73Z"
      />
      <path
        className="cls-4"
        d="M581.31,891.73a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,581.31,891.73Z"
      />
      <path
        className="cls-4"
        d="M514.45,891.73a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,514.45,891.73Z"
      />
      <path
        className="cls-4"
        d="M363.84,891.73a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,363.84,891.73Z"
      />
      <path
        className="cls-5"
        d="M548.36,891.73a7.47,7.47,0,1,1,7.46,7.47A7.47,7.47,0,0,1,548.36,891.73Z"
      />
      <path
        className="cls-5"
        d="M454,891.73a7.47,7.47,0,1,1,7.47,7.47A7.48,7.48,0,0,1,454,891.73Z"
      />
      <path
        className="cls-2"
        d="M378.78,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,378.78,923.75Z"
      />
      <path
        className="cls-2"
        d="M411.74,923.75a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,411.74,923.75Z"
      />
      <path
        className="cls-2"
        d="M444.69,923.75a7.47,7.47,0,1,1-7.46-7.47A7.46,7.46,0,0,1,444.69,923.75Z"
      />
      <path
        className="cls-2"
        d="M477.65,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,477.65,923.75Z"
      />
      <path
        className="cls-2"
        d="M733,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,733,923.75Z"
      />
      <path
        className="cls-2"
        d="M766.65,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,766.65,923.75Z"
      />
      <path
        className="cls-2"
        d="M510.61,923.75a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,510.61,923.75Z"
      />
      <path
        className="cls-2"
        d="M672.46,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,672.46,923.75Z"
      />
      <path
        className="cls-4"
        d="M543.57,923.75a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,543.57,923.75Z"
      />
      <path
        className="cls-4"
        d="M576.52,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,576.52,923.75Z"
      />
      <path
        className="cls-4"
        d="M643.39,923.75a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,643.39,923.75Z"
      />
      <path
        className="cls-4"
        d="M794,923.75a7.47,7.47,0,1,1-7.46-7.47A7.46,7.46,0,0,1,794,923.75Z"
      />
      <path
        className="cls-5"
        d="M609.48,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,609.48,923.75Z"
      />
      <path
        className="cls-5"
        d="M703.84,923.75a7.47,7.47,0,1,1-7.47-7.47A7.46,7.46,0,0,1,703.84,923.75Z"
      />
      <rect
        className="cls-2"
        x="198.74"
        y="845.26"
        width="130.19"
        height="20.03"
      />
      <rect
        className="cls-2"
        x="198.74"
        y="879.72"
        width="130.19"
        height="20.03"
      />
      <rect
        className="cls-2"
        x="198.74"
        y="915.36"
        width="130.19"
        height="20.03"
      />
      <polygon
        className="cls-2"
        points="930 772.81 830.6 773.08 830.6 609.03 930 608.76 930 772.81"
      />
      <polygon
        className="cls-2"
        points="930 573.35 830.6 573.61 830.6 409.56 930 409.3 930 573.35"
      />
      <polygon
        className="cls-2"
        points="930 973.97 830.6 974.24 830.6 810.19 930 809.93 930 973.97"
      />
      <rect
        className="cls-3"
        x="174.17"
        y="408.05"
        width="661.21"
        height="164.05"
      />
      <rect
        className="cls-2"
        x="203.53"
        y="441.84"
        width="130.19"
        height="20.03"
      />
      <rect
        className="cls-2"
        x="203.53"
        y="476.3"
        width="130.19"
        height="20.03"
      />
      <rect
        className="cls-2"
        x="203.53"
        y="511.94"
        width="129.62"
        height="20.03"
      />
      <path
        className="cls-2"
        d="M385.2,453.94a7.47,7.47,0,1,1-7.46-7.47A7.47,7.47,0,0,1,385.2,453.94Z"
      />
      <circle className="cls-2" cx="410.69" cy="453.94" r="7.47" />
      <path
        className="cls-2"
        d="M451.12,453.94a7.47,7.47,0,1,1-7.47-7.47A7.48,7.48,0,0,1,451.12,453.94Z"
      />
      <circle className="cls-2" cx="476.61" cy="453.94" r="7.47" />
      <path
        className="cls-2"
        d="M739.47,453.94a7.47,7.47,0,1,1-7.47-7.47A7.48,7.48,0,0,1,739.47,453.94Z"
      />
      <circle className="cls-2" cx="765.61" cy="453.94" r="7.47" />
      <path
        className="cls-2"
        d="M517,453.94a7.47,7.47,0,1,1-7.46-7.47A7.47,7.47,0,0,1,517,453.94Z"
      />
      <circle className="cls-2" cx="671.42" cy="453.94" r="7.47" />
      <path
        className="cls-4"
        d="M550,453.94a7.47,7.47,0,1,1-7.47-7.47A7.47,7.47,0,0,1,550,453.94Z"
      />
      <path
        className="cls-4"
        d="M583,453.94a7.47,7.47,0,1,1-7.47-7.47A7.48,7.48,0,0,1,583,453.94Z"
      />
      <path
        className="cls-4"
        d="M649.81,453.94a7.47,7.47,0,1,1-7.46-7.47A7.47,7.47,0,0,1,649.81,453.94Z"
      />
      <path
        className="cls-4"
        d="M800.42,453.94a7.47,7.47,0,1,1-7.47-7.47A7.48,7.48,0,0,1,800.42,453.94Z"
      />
      <path
        className="cls-5"
        d="M615.9,453.94a7.47,7.47,0,1,1-7.46-7.47A7.47,7.47,0,0,1,615.9,453.94Z"
      />
      <circle className="cls-5" cx="702.8" cy="453.94" r="7.47" />
      <path
        className="cls-2"
        d="M785.48,489.94a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,785.48,489.94Z"
      />
      <path
        className="cls-2"
        d="M752.52,489.94a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,752.52,489.94Z"
      />
      <path
        className="cls-2"
        d="M719.57,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,719.57,489.94Z"
      />
      <path
        className="cls-2"
        d="M686.61,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,686.61,489.94Z"
      />
      <path
        className="cls-2"
        d="M431.22,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,431.22,489.94Z"
      />
      <path
        className="cls-2"
        d="M397.61,489.94a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,397.61,489.94Z"
      />
      <path
        className="cls-2"
        d="M653.65,489.94a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,653.65,489.94Z"
      />
      <path
        className="cls-2"
        d="M491.8,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,491.8,489.94Z"
      />
      <path
        className="cls-4"
        d="M620.7,489.94a7.47,7.47,0,1,1,7.46,7.47A7.46,7.46,0,0,1,620.7,489.94Z"
      />
      <path
        className="cls-4"
        d="M587.74,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,587.74,489.94Z"
      />
      <path
        className="cls-4"
        d="M520.87,489.94a7.47,7.47,0,1,1,7.47,7.47A7.47,7.47,0,0,1,520.87,489.94Z"
      />
      <path
        className="cls-4"
        d="M370.27,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,370.27,489.94Z"
      />
      <path
        className="cls-5"
        d="M554.78,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,554.78,489.94Z"
      />
      <path
        className="cls-5"
        d="M460.42,489.94a7.47,7.47,0,1,1,7.47,7.47A7.46,7.46,0,0,1,460.42,489.94Z"
      />
      <path
        className="cls-2"
        d="M385.2,522a7.47,7.47,0,1,1-7.46-7.46A7.46,7.46,0,0,1,385.2,522Z"
      />
      <path
        className="cls-2"
        d="M418.16,522a7.47,7.47,0,1,1-7.47-7.46A7.46,7.46,0,0,1,418.16,522Z"
      />
      <path
        className="cls-2"
        d="M451.12,522a7.47,7.47,0,1,1-7.47-7.46A7.47,7.47,0,0,1,451.12,522Z"
      />
      <path
        className="cls-2"
        d="M484.08,522a7.47,7.47,0,1,1-7.47-7.46A7.47,7.47,0,0,1,484.08,522Z"
      />
      <path
        className="cls-2"
        d="M739.47,522a7.47,7.47,0,1,1-7.47-7.46A7.47,7.47,0,0,1,739.47,522Z"
      />
      <path
        className="cls-2"
        d="M773.07,522a7.47,7.47,0,1,1-7.46-7.46A7.46,7.46,0,0,1,773.07,522Z"
      />
      <path
        className="cls-2"
        d="M517,522a7.47,7.47,0,1,1-7.46-7.46A7.46,7.46,0,0,1,517,522Z"
      />
      <path
        className="cls-2"
        d="M678.89,522a7.47,7.47,0,1,1-7.47-7.46A7.47,7.47,0,0,1,678.89,522Z"
      />
      <path
        className="cls-4"
        d="M550,522a7.47,7.47,0,1,1-7.47-7.46A7.46,7.46,0,0,1,550,522Z"
      />
      <path
        className="cls-4"
        d="M583,522a7.47,7.47,0,1,1-7.47-7.46A7.47,7.47,0,0,1,583,522Z"
      />
      <path
        className="cls-4"
        d="M649.81,522a7.47,7.47,0,1,1-7.46-7.46A7.46,7.46,0,0,1,649.81,522Z"
      />
      <path
        className="cls-4"
        d="M800.42,522a7.47,7.47,0,1,1-7.47-7.46A7.47,7.47,0,0,1,800.42,522Z"
      />
      <path
        className="cls-5"
        d="M615.9,522a7.47,7.47,0,1,1-7.46-7.46A7.46,7.46,0,0,1,615.9,522Z"
      />
      <path
        className="cls-5"
        d="M710.27,522a7.47,7.47,0,1,1-7.47-7.46A7.47,7.47,0,0,1,710.27,522Z"
      />
      <path
        className="cls-6"
        d="M625.72,252.09h0A20.15,20.15,0,0,1,600,254.48c-18.29-12.65-41.48-22.63-69.11-22.63s-50.81,10-69.11,22.63A20.15,20.15,0,0,1,436,252.09h0a20.16,20.16,0,0,1,3-30.92c22.57-15.18,53.49-28.78,91.83-28.78s69.26,13.6,91.84,28.78A20.16,20.16,0,0,1,625.72,252.09Z"
      />
      <path
        className="cls-7"
        d="M667.85,209.67h0a19.27,19.27,0,0,1-25.33,1.75c-25.16-19.09-62.91-38.75-111.65-38.75s-86.49,19.66-111.65,38.75a19.27,19.27,0,0,1-25.33-1.75h0A19.28,19.28,0,0,1,395.57,181c25.58-20.44,71.7-47.81,135.3-47.81S640.6,160.58,666.17,181A19.27,19.27,0,0,1,667.85,209.67Z"
      />
      <path
        className="cls-8"
        d="M709.57,167.66l-.17.17A18.7,18.7,0,0,1,684.15,169c-26.45-22-78.92-55.5-153.28-55.5S404,147,377.59,169a18.7,18.7,0,0,1-25.25-1.15l-.17-.17a18.67,18.67,0,0,1,1-27.23,273.07,273.07,0,0,1,355.45,0A18.67,18.67,0,0,1,709.57,167.66Z"
      />
      <path
        className="cls-9"
        d="M582.31,295.8h0a20,20,0,0,1-23.44,3.74,58.12,58.12,0,0,0-56,0,20,20,0,0,1-23.44-3.74h0a20.14,20.14,0,0,1,4.65-31.86,94.76,94.76,0,0,1,93.59,0A20.14,20.14,0,0,1,582.31,295.8Z"
      />
      <circle className="cls-10" cx="530.87" cy="334.11" r="22.36" />
      {/* Exclamation Point */}
      {color === "red" && (
        <>
          <circle className="cls-11" cx="575.87" cy="336.94" r="18.21" />
          <path
            className="cls-1"
            d="M575.87,323.24a13.71,13.71,0,1,1-13.7,13.7,13.7,13.7,0,0,1,13.7-13.7m0-9a22.71,22.71,0,1,0,22.71,22.7,22.72,22.72,0,0,0-22.71-22.7Z"
          />
          <path
            className="cls-11"
            d="M575.87,310.39a18.65,18.65,0,0,1-18.62-18.63V178.63a18.63,18.63,0,1,1,37.25,0V291.76A18.65,18.65,0,0,1,575.87,310.39Z"
          />
          <path
            className="cls-1"
            d="M575.87,164.5A14.13,14.13,0,0,1,590,178.63V291.76a14.13,14.13,0,0,1-14.13,14.13h0a14.13,14.13,0,0,1-14.13-14.13V178.63a14.13,14.13,0,0,1,14.13-14.13h0m0-9a23.15,23.15,0,0,0-23.13,23.13V291.76a23.13,23.13,0,1,0,46.26,0V178.63a23.15,23.15,0,0,0-23.13-23.13Z"
          />
        </>
      )}
    </svg>
  );
}