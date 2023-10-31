import { Group, Text, ThemeIcon } from "@mantine/core";
import React, { forwardRef, useMemo } from "react";
import { Icons } from "../constants/categories";

interface ItemProps extends React.ComponentPropsWithoutRef<"div"> {
  image: string;
  value: string;
  icon: string;
  label: string;
  description: string;
}

function CategorySelectItem(
  { label, value, icon, color, ...rest }: ItemProps,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const Icon = useMemo(() => Icons[icon], [icon]);
  return (
    <div ref={ref} {...rest}>
      <Group noWrap spacing="xs">
        <ThemeIcon color={color} variant="light">
          <Icon size={16} />
        </ThemeIcon>

        <div>
          <Text size="sm">{label}</Text>
        </div>
      </Group>
    </div>
  );
}

export default forwardRef<HTMLDivElement, ItemProps>(CategorySelectItem);
