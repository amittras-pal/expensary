import { Badge, ComboboxItem, Group, SelectProps, Text } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";

type Option = ComboboxItem & { open: boolean };

const PlanSelectaOption: SelectProps["renderOption"] = ({
  option,
  checked,
}) => {
  return (
    <Group gap={6} align="center" style={{ width: "100%" }}>
      <Text fz="sm" mr={"auto"}>
        {option.label}
      </Text>
      {checked && <IconCheck size={16} />}
      <Badge
        size="sm"
        variant="light"
        color={(option as Option).open ? "green" : "red"}
      >
        {(option as Option).open ? "Open" : "Closed"}
      </Badge>
    </Group>
  );
};

export default PlanSelectaOption;
