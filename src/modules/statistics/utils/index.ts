import dayjs from "dayjs";

const numAbbrFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});

export const monthFormatter = (value: number) => {
  return dayjs()
    .month(value - 1)
    .format("MMM");
};

export function abbreviateNumber(value: number) {
  return numAbbrFormat.format(value);
}
