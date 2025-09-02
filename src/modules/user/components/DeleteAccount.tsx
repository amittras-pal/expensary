import {
  Alert,
  Button,
  Group,
  List,
  Modal,
  Paper,
  Stack,
  Text,
  Title,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconAlertTriangle,
  IconClipboardList,
  IconPigMoney,
  IconReceipt,
  IconTrash,
  IconUser,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import PinInput from "../../../components/pin-input/PinInput";
import { deleteUserAccount } from "../../../services/user.service";
import { useErrorHandler } from "../../../hooks/error-handler";

const DeleteAccount = () => {
  const [modalOpened, setModalOpened] = useState(false);
  const [confirmPin, setConfirmPin] = useState("");
  const { primaryColor, colors } = useMantineTheme();
  const { onError } = useErrorHandler();
  const queryClient = useQueryClient();

  const deleteAccountMutation = useMutation({
    mutationFn: deleteUserAccount,
    onSuccess: (res) => {
      console.log(res);

      notifications.show({
        title: "Account Deleted",
        message: "Your account has been successfully deleted.",
        color: "green",
      });
      setModalOpened(false);

      // Clear localStorage
      localStorage.clear();

      // Clear all cached queries
      queryClient.clear();

      // Redirect to logout or home page would typically happen here
      window.location.href = "/"; // Simple redirect after account deletion
    },
    onError,
  });

  const openDeleteConfirmation = () => {
    setModalOpened(true);
    setConfirmPin(""); // Reset pin when opening modal
  };

  const handleDeleteAccount = async () => {
    deleteAccountMutation.mutate({
      pin: confirmPin,
    });
  };

  return (
    <>
      <Paper
        withBorder
        p="md"
        radius="md"
        sx={{ border: `1px solid ${colors.red[7]} !important` }}
      >
        <Title order={4} mb="md" color="red">
          Delete Account
        </Title>
        <Stack spacing="md">
          <Alert
            icon={<IconAlertTriangle size="1rem" />}
            color="red"
            variant="light"
          >
            <Text size="sm">
              <strong>Warning:</strong> This action is irreversible. Deleting
              your account will permanently remove all your data, expenses,
              budgets, and preferences. This cannot be undone.
            </Text>
          </Alert>

          <Text size="sm" color="dimmed">
            If you're sure you want to delete your account, click the button
            below. You will be asked to confirm this action.
          </Text>

          <Group position="right">
            <Button
              leftIcon={<IconTrash size="1rem" />}
              onClick={openDeleteConfirmation}
              loading={deleteAccountMutation.isLoading}
              color="red"
              variant="filled"
              size="sm"
            >
              {deleteAccountMutation.isLoading
                ? "Deleting Account..."
                : "Delete My Account"}
            </Button>
          </Group>
        </Stack>
      </Paper>

      <Modal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        title="Delete Your Account"
        centered
      >
        <Text size="sm" mb="md">
          Are you absolutely sure you want to delete your account? This action
          cannot be undone and will permanently remove:
        </Text>
        <List
          spacing="xs"
          size="sm"
          mb="md"
          center
          icon={<IconAlertTriangle size="1rem" color="red" />}
        >
          <List.Item
            icon={<IconReceipt size="1rem" color={colors[primaryColor][5]} />}
          >
            All your expense data
          </List.Item>
          <List.Item
            icon={<IconPigMoney size="1rem" color={colors[primaryColor][5]} />}
          >
            Budget information
          </List.Item>
          <List.Item
            icon={
              <IconClipboardList size="1rem" color={colors[primaryColor][5]} />
            }
          >
            Expense Plans
          </List.Item>
          <List.Item
            icon={<IconUser size="1rem" color={colors[primaryColor][5]} />}
          >
            Account settings
          </List.Item>
        </List>
        <Text size="sm" fw={500} mb="xs">
          Please enter your PIN to confirm account deletion:
        </Text>
        <PinInput
          length={6}
          mask
          autoFocus
          onChange={(value) => setConfirmPin(value)}
          error={false}
          errorMsg=""
          label=""
        />
        <Group position="left" mt="md" sx={{ flexDirection: "row-reverse" }}>
          <Button
            color="red"
            onClick={handleDeleteAccount}
            disabled={
              confirmPin.length !== 6 || deleteAccountMutation.isLoading
            }
            loading={deleteAccountMutation.isLoading}
          >
            Delete Account
          </Button>
          <Button variant="default" onClick={() => setModalOpened(false)}>
            Cancel
          </Button>
        </Group>
      </Modal>
    </>
  );
};

export default DeleteAccount;
