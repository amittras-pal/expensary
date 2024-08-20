import { Button, Group, MultiSelectValueProps, Tooltip } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import { useMemo } from "react";
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
    <Group spacing={0} {...rest}>
      <Tooltip label={label} withinPortal position="bottom" color="dark">
        <Button.Group>
          <Button
            radius="lg"
            color={color}
            variant="light"
            size="xs"
            px={4}
            sx={{ pointerEvents: "none", maxHeight: "22px" }}
            tabIndex={-1}
          >
            <Icon size={14} />
          </Button>
          <Button
            color="red"
            variant="light"
            radius="lg"
            size="xs"
            px={4}
            sx={{ maxHeight: "22px" }}
            onClick={onRemove}
          >
            <IconX size={14} />
          </Button>
        </Button.Group>
      </Tooltip>
    </Group>
  );
}
