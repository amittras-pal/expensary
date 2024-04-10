import {
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

import { useErrorHandler } from "../../../hooks/error-handler";
import { deletePlan } from "../../../services/plans.service";
import ExpensePlan from "./ExpensePlan";

interface IDeletePlanProps {
  data?: IExpensePlan | null;
  onComplete: (e: boolean) => void;
}

export default function DeletePlan({
  data,
  onComplete,
}: Readonly<IDeletePlanProps>) {
  const { primaryColor } = useMantineTheme();
  const { onError } = useErrorHandler();

  const { mutate, isLoading: deleting } = useMutation({
    mutationFn: deletePlan,
    onSuccess: (res) => {
      onComplete(true);
      notifications.show({
        message: res.message,
        color: "green",
        icon: <IconCheck />,
      });
    },
    onError,
  });

  return (
    <Box>
      <Text c={primaryColor}>
        Are you sure you want to delete the following expense plan?
      </Text>
      <Divider my="md" />
      {data && <ExpensePlan data={data} hideMenu />}
      <Divider my="md" />
      <Text color="red">
        This action will delete all expenses added to this plan.
      </Text>
      <Text color="red" fw="bold">
        This action cannot be undone.
      </Text>
      <Group grow mt="md">
        <Button
          variant="outline"
          onClick={() => onComplete(false)}
          disabled={deleting}
        >
          Cancel
        </Button>
        <Button onClick={() => mutate(data?._id ?? "")} loading={deleting}>
          Delete
        </Button>
      </Group>
    </Box>
  );
}
