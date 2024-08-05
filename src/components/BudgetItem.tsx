import {
  Badge,
  Box,
  Checkbox,
  Group,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { useMemo } from "react";
import { Icons } from "../constants/categories";
import { useBudgetItemStyles } from "../theme/modules/budgetItem.styles";
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

  const { classes } = useBudgetItemStyles();
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
      <Box className={classes.elevate} sx={{ width: "100%" }}>
        <Group align="center" mb={2} position="apart">
          <Badge color={subCategories[0].color} size="sm" radius="sm">
            {category}
          </Badge>
          <Text fw="bold">{formatCurrency(total)} </Text>
        </Group>
        <Group spacing={6} align="center">
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
          <Text color="dimmed" fz="xs" ml="auto" pt={1}>
            ({share}%)
          </Text>
        </Group>
      </Box>
      <Box
        className={classes.share}
        sx={(theme) => ({
          width: `${share}%`,
          backgroundColor: theme.colors[subCategories[0].color][7],
        })}
      />
    </Box>
  );
}

export default BudgetItem;
