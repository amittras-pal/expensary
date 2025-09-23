import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useErrorHandler } from "../hooks/error-handler";
import { deleteExpense } from "../services/expense.service";
import ExpenseCard from "./ExpenseCard";

interface IDeleteExpenseProps {
  data: IExpense | null;
  onComplete: (refresh: boolean | IExpense) => void;
}

export default function DeleteExpense({
  data,
  onComplete,
}: Readonly<IDeleteExpenseProps>) {
  const { primaryColor } = useMantineTheme();
  const { onError } = useErrorHandler();

  const { mutate: deleteItem, isLoading: deleting } = useMutation({
    mutationFn: deleteExpense,
    onSuccess: (res) => {
      onComplete(true);
      notifications.show({
        message: res?.message,
        color: "green",
        icon: <IconCheck />,
      });
    },
    onError,
  });

  return (
    <Box>
      <Text c={primaryColor}>
        Are you sure you want to delete the following expense?
      </Text>
      <Divider my="sm" />
      {data && <ExpenseCard hideMenu data={data} />}
      {data?.linked && (
        <Alert title="Linked Expense" color="red" mb="md">
          This expense is linked to another expense, deleting it will also
          delete the other one.
        </Alert>
      )}
      <Text c="red" fz="sm" fw="bold">
        This action cannot be undone!
      </Text>
      <Group grow mt="lg">
        <Button
          variant="outline"
          onClick={() => onComplete(false)}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button onClick={() => deleteItem(data?._id ?? "")} loading={deleting}>
          Delete
        </Button>
      </Group>
    </Box>
  );
}
