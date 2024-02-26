import { Text, TextProps } from "@mantine/core";
import { urlRX } from "../constants/app";

const ExpenseDescription = ({ children = "", ...rest }: TextProps) => {
  return (
    <Text {...rest} component="p" fz="xs" sx={{ whiteSpace: "pre-wrap" }} m={0}>
      {(children as string).split(" ").map((part, i) =>
        urlRX.test(part) ? (
          <Text
            key={part + i}
            component="a"
            href={part}
            target="_blank"
            rel="noreferrer"
            fw={500}
            c="white"
          >
            {new URL(part).host}{" "}
          </Text>
        ) : (
          <Text component="span" key={part + i}>
            {part}{" "}
          </Text>
        )
      )}
    </Text>
  );
};

export default ExpenseDescription;
