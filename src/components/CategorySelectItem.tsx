import {
  ComboboxItem,
  Group,
  SelectProps,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { Icons } from "../constants/categories";
import { IconCheck } from "@tabler/icons-react";

type Option = ComboboxItem & { meta: string };

const CategorySelectItem: SelectProps["renderOption"] = ({
  option,
  checked,
}) => {
  const [icon, color] = (option as Option).meta.split("::");
  const Icon = Icons[icon];

  return (
    <Group gap={6} align="center" style={{ width: "100%" }}>
      <ThemeIcon variant={checked ? "light" : "transparent"} color={color}>
        <Icon size={16} />
      </ThemeIcon>
      <Text fz="sm" mr={"auto"}>
        {option.label.split("::").at(-1)}
      </Text>
      {checked && <IconCheck size={16} />}
    </Group>
  );
};

export default CategorySelectItem;
