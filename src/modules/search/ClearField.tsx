import { ActionIcon } from "@mantine/core";
import { IconX } from "@tabler/icons-react";

export default function ClearField(
  props: Readonly<{
    onClick?: React.MouseEventHandler<HTMLButtonElement>;
    disabled?: boolean;
  }>
) {
  if (props.disabled) return null;

  return (
    <ActionIcon size="sm" color="red" variant="light" onClick={props.onClick}>
      <IconX size={16} />
    </ActionIcon>
  );
}
