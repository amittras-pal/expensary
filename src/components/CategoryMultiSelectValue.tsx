import { Badge, CloseButton, MultiSelectValueProps } from "@mantine/core";
import React, { useMemo } from "react";
import { Icons } from "../constants/categories";

export default function CategoryMultiSelectValue({
  label,
  value,
  icon,
  color,
  onRemove,
  classNames,
  ...rest
}: MultiSelectValueProps & { value: string; icon: string }) {
  const Icon = useMemo(() => Icons[icon], [icon]);

  return (
    <div {...rest}>
      <Badge
        variant="light"
        color={color}
        sx={{ paddingRight: "0px" }}
        leftSection={<Icon size={12} style={{ marginBottom: -2 }} />}
        rightSection={
          <CloseButton
            onMouseDown={onRemove}
            color="red"
            variant="filled"
            size={22}
            iconSize={14}
            tabIndex={-1}
          />
        }
      >
        {label}
      </Badge>
    </div>
  );
}
