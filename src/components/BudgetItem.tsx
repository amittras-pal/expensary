import {
  Badge,
  Box,
  Checkbox,
  Group,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import React, { useMemo } from "react";
import { Icons } from "../constants/categories";
import { useBudgetItemStyles } from "../theme/modules/budgetItem.styles";
import { formatCurrency } from "../utils";

interface IBudgetItemProps {
  showSelection?: boolean;
  selection?: string[];
  onSelectionChange?: React.ChangeEventHandler<HTMLInputElement>;
  data: [string, SummaryItem];
}

function BudgetItem({
  showSelection,
  selection,
  onSelectionChange,
  data,
}: IBudgetItemProps) {
  const [category, { subCategories, total }] = data;

  const { classes } = useBudgetItemStyles();
  const subItems = useMemo(() => {
    return data[1].subCategories.map((item) => ({
      ...item,
      Icon: Icons[item.icon],
    }));
  }, [data]);

  return (
    <Box className={classes.item}>
      {showSelection && (
        <Checkbox
          size="sm"
          value={category}
          checked={selection?.includes(category)}
          onChange={onSelectionChange}
        />
      )}
      <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
        <Group align="center" mb={2} position="apart">
          <Badge color={subCategories[0].color} size="sm" radius="sm">
            {category}
          </Badge>
          <Text fw="bold">{formatCurrency(total)}</Text>
        </Group>
        <Group spacing={6}>
          {subItems.map(({ label, value, color, Icon }) => (
            <Tooltip
              label={`${label}: ${formatCurrency(value)}`}
              withArrow
              key={label}
              events={{ hover: true, touch: true, focus: true }}
              position="right"
            >
              <ThemeIcon size="sm" variant="light" color={color}>
                <Icon size={16} />
              </ThemeIcon>
            </Tooltip>
          ))}
        </Group>
      </Box>
    </Box>
  );
}

export default BudgetItem;
