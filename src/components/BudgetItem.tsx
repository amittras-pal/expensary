import { useMemo } from "react";
import {
  Badge,
  Box,
  Checkbox,
  Group,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { Icons } from "../constants/categories";
import classes from "../theme/modules/budgetItem.module.scss";
import { formatCurrency, getPercentage } from "../utils";

interface IBudgetItemProps {
  showSelection?: boolean;
  selection?: string[];
  onSelectionChange?: React.ChangeEventHandler<HTMLInputElement>;
  data: [string, SummaryItem];
  overallSpent: number;
}

function BudgetItem({
  showSelection,
  selection,
  onSelectionChange,
  data,
  overallSpent,
}: Readonly<IBudgetItemProps>) {
  const [category, { subCategories, total }] = data;

  const subItems = useMemo(() => {
    return data[1].subCategories.map((item) => ({
      ...item,
      Icon: Icons[item.icon],
    }));
  }, [data]);

  const share = useMemo(
    () => getPercentage(total, overallSpent),
    [total, overallSpent]
  );

  return (
    <Box className={classes.item}>
      {showSelection && (
        <Checkbox
          size="sm"
          value={category}
          checked={selection?.includes(category)}
          onChange={onSelectionChange}
          className={classes.elevate}
        />
      )}
      <Box className={classes.elevate} style={{ width: "100%" }}>
        <Group align="center" mb={2} justify="space-between">
          <Badge
            variant="light"
            color={subCategories[0].color}
            size="sm"
            radius="sm"
          >
            {category}
          </Badge>
          <Text fw="bold">{formatCurrency(total)} </Text>
        </Group>
        <Group gap={6} align="center">
          {subItems.map(({ label, value, color, Icon }) => (
            <Tooltip
              label={`${label}: ${formatCurrency(value)}`}
              withArrow
              key={label}
              position="right"
            >
              <ThemeIcon size="sm" variant="light" color={color}>
                <Icon size={16} />
              </ThemeIcon>
            </Tooltip>
          ))}
          <Text c="dimmed" fz="xs" ml="auto" pt={1}>
            {share < 1 ? "<1" : share} %
          </Text>
        </Group>
      </Box>
      <Box
        className={classes.share}
        style={{
          width: `${share}%`,
          backgroundColor: `var(--mantine-color-${subCategories[0].color}-7)`,
        }}
      />
    </Box>
  );
}

export default BudgetItem;
