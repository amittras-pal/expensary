import { useState } from "react";
import { Box, Button, Group, Loader, Stack, Text } from "@mantine/core";
import { IconPlus, IconRefresh } from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { _20Min } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import EmptyState from "../../resources/empty-state.svg?react";
import {
  deleteRecurringExpense,
  getRecurringExpenses,
  updateRecurringExpense,
} from "../../services/recurring-expense.service";
import ExpenseRule from "./ExpenseRule";
import RecurringExpenseForm from "./RecurringExpenseForm";

export default function RecurringExpenses() {
  const { onError } = useErrorHandler();
  const [formData, setFormData] = useState<IRecurringExpense | null>(null);
  const [showForm, setShowForm] = useState(false);
  const client = useQueryClient();

  const {
    data: response,
    isLoading,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ["recurring-expenses"],
    queryFn: getRecurringExpenses,
    onError,
    staleTime: _20Min,
  });

  const { mutate: toggleActive } = useMutation({
    mutationFn: updateRecurringExpense,
    onSuccess: () => client.invalidateQueries(["recurring-expenses"]),
    onError,
  });

  const { mutate: removeRule } = useMutation({
    mutationFn: deleteRecurringExpense,
    onSuccess: () => client.invalidateQueries(["recurring-expenses"]),
    onError,
  });

  const rules = response?.response ?? [];

  const openCreateForm = () => {
    setFormData(null);
    setShowForm(true);
  };

  const openEditForm = (rule: IRecurringExpense) => {
    setFormData(rule);
    setShowForm(true);
  };

  const closeForm = () => {
    setFormData(null);
    setShowForm(false);
  };

  if (showForm) {
    return <RecurringExpenseForm data={formData} onClose={closeForm} />;
  }

  return (
    <Stack gap="xs">
      <Group justify="space-between" align="center">
        <Box>
          <Text fz="sm" c="dimmed">
            Set up recurring expenses that are automatically created each month
            on a configured date.
          </Text>
        </Box>
        <Group gap="xs" justify="flex-end" style={{ width: "100%" }}>
          <Button
            variant="subtle"
            size="sm"
            leftSection={<IconRefresh size={16} />}
            onClick={() => refetch()}
            loading={isFetching && !isLoading}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={openCreateForm}
          >
            Add Rule
          </Button>
        </Group>
      </Group>

      {isLoading && (
        <Box py="xl" style={{ display: "flex", justifyContent: "center" }}>
          <Loader size="sm" />
        </Box>
      )}

      {!isLoading && rules.length === 0 && (
        <Stack align="center" py="xl" gap="sm">
          <EmptyState height={120} />
          <Text fz="sm" fs="italic" c="dimmed" ta="center">
            No recurring expenses configured yet.
          </Text>
          <Button
            variant="light"
            size="sm"
            leftSection={<IconPlus size={16} />}
            onClick={openCreateForm}
          >
            Add Rule
          </Button>
        </Stack>
      )}

      {!isLoading && rules.length > 0 && (
        <Stack gap="xs">
          {rules.map((rule) => (
            <ExpenseRule
              key={rule._id}
              onToggle={(e) => {
                e.stopPropagation();
                toggleActive({
                  _id: rule._id,
                  title: rule.title,
                  categoryId: rule.categoryId,
                  dayOfMonth: rule.dayOfMonth,
                  active: !rule.active,
                });
              }}
              onEdit={() => openEditForm(rule)}
              onDelete={(e) => {
                e.stopPropagation();
                if (rule._id) removeRule(rule._id);
              }}
              rule={rule}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
}
