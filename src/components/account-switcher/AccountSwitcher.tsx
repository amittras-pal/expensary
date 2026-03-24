import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Avatar,
  Button,
  Menu,
  Modal,
  Stack,
  Text,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconLogin2,
  IconSwitchHorizontal,
  IconUserPlus,
} from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { AUTH_ERROR_CODES, AUTH_EVENTS } from "../../constants/auth";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useLogoutHandler } from "../../hooks/logout";
import { loginUser, switchActiveAccount } from "../../services/user.service";
import PinInput from "../pin-input/PinInput";

function getInitials(userName: string | undefined): string {
  if (!userName) return "U";

  const initials = userName
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "U";
}

export default function AccountSwitcher() {
  const theme = useMantineTheme();
  const client = useQueryClient();
  const navigate = useNavigate();

  const [, setPrimaryColor] = useLocalStorage({ key: "primary-color" });

  const { userData, accounts, activeAccountId, applyUserSession } =
    useCurrentUser();
  const { logout, logoutAll, loggingOut } = useLogoutHandler();
  const { onError } = useErrorHandler();

  const [reauthAccountId, setReauthAccountId] = useState<string | null>(null);
  const [reauthPin, setReauthPin] = useState("");
  const [pendingSwitchId, setPendingSwitchId] = useState<string | null>(null);
  const [showReAuth, reauth] = useDisclosure(false);

  const activeAccount = useMemo(
    () =>
      accounts.find((account) => account.accountId === activeAccountId) ?? null,
    [accounts, activeAccountId]
  );

  const reauthAccount = useMemo(
    () =>
      accounts.find((account) => account.accountId === reauthAccountId) ?? null,
    [accounts, reauthAccountId]
  );

  const closeReauthModal = () => {
    setReauthPin("");
    setReauthAccountId(null);
    reauth.close();
  };

  useEffect(() => {
    const listener = (event: Event) => {
      const authEvent = event as CustomEvent<{ accountId?: string }>;
      const accountId = authEvent.detail?.accountId;
      if (!accountId) return;

      const knownAccount = accounts.find(
        (account) => account.accountId === accountId
      );
      if (!knownAccount) {
        notifications.show({
          title: "Login required",
          message: "No saved account found for re-authentication.",
          color: "red",
        });
        navigate("/login");
        return;
      }

      setReauthAccountId(accountId);
      setReauthPin("");
      reauth.open();
    };

    globalThis.addEventListener(
      AUTH_EVENTS.reauthRequired,
      listener as EventListener
    );

    return () => {
      globalThis.removeEventListener(
        AUTH_EVENTS.reauthRequired,
        listener as EventListener
      );
    };
  }, [accounts, navigate, reauth]);

  const { mutate: switchAccount, isLoading: switchingAccount } = useMutation({
    mutationFn: switchActiveAccount,
    onSuccess: (res, vars) => {
      setPendingSwitchId(null);
      client.clear();
      applyUserSession(res.response, vars.accountId);
      setPrimaryColor(res.response.color);

      notifications.show({
        color: "green",
        icon: <IconCheck />,
        title: "Account switched",
        message: `Active account is now ${res.response.userName}`,
      });
    },
    onError: (err, vars) => {
      setPendingSwitchId(null);

      if (axios.isAxiosError(err)) {
        const payload = (err.response?.data ?? {}) as { code?: string };
        if (
          err.response?.status === 401 &&
          payload.code === AUTH_ERROR_CODES.reauthRequired
        ) {
          setReauthAccountId(vars.accountId);
          setReauthPin("");
          reauth.open();
          return;
        }
      }

      onError(err);
    },
  });

  const { mutate: reAuthenticate, isLoading: reAuthenticating } = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      client.clear();
      applyUserSession(
        res.response,
        res.sessionMeta?.activeAccountId ?? res.response._id ?? null
      );
      setPrimaryColor(res.response.color);

      notifications.show({
        color: "green",
        icon: <IconCheck />,
        title: "Re-authentication successful",
        message: `Welcome back, ${res.response.userName}`,
      });

      closeReauthModal();
    },
    onError,
  });

  const handleSwitchAccount = (accountId: string) => {
    if (accountId === activeAccountId || switchingAccount) return;

    setPendingSwitchId(accountId);
    switchAccount({ accountId });
  };

  const handleReAuth = () => {
    if (!reauthAccount || reauthPin.length !== 6) return;

    reAuthenticate({ email: reauthAccount.email, pin: reauthPin });
  };

  const accountName = reauthAccount?.userName ?? "Unknown account";
  const accountEmail = reauthAccount?.email ?? "No email available";

  return (
    <>
      <Menu width={280} position="bottom-end" withArrow>
        <Menu.Target>
          <ActionIcon size="md" variant="default" radius="xl">
            <Avatar
              size={24}
              color={activeAccount?.color || theme.primaryColor}
            >
              {activeAccount?.initials || getInitials(userData?.userName)}
            </Avatar>
          </ActionIcon>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Label>Accounts on this device</Menu.Label>
          {accounts.length === 0 && (
            <Menu.Item disabled>No account found</Menu.Item>
          )}
          {accounts.map((account) => (
            <Menu.Item
              key={account.accountId}
              onClick={() => handleSwitchAccount(account.accountId)}
              disabled={
                account.accountId === activeAccountId ||
                (switchingAccount && pendingSwitchId === account.accountId)
              }
              leftSection={
                <Avatar size={22} color={account.color}>
                  {account.initials}
                </Avatar>
              }
              rightSection={
                account.accountId === activeAccountId ? (
                  <IconCheck size={14} />
                ) : undefined
              }
            >
              <Stack gap={0}>
                <Text size="sm" fw={500}>
                  {account.userName}
                </Text>
                <Text size="xs" c="dimmed">
                  {account.email}
                </Text>
              </Stack>
            </Menu.Item>
          ))}

          <Menu.Divider />

          <Menu.Item
            component={Link}
            to="/login?add=1"
            leftSection={<IconUserPlus size={16} />}
          >
            Add another account
          </Menu.Item>
          <Menu.Item
            leftSection={<IconLogin2 size={16} />}
            onClick={() => logout("current")}
            disabled={loggingOut}
          >
            Logout current account
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconSwitchHorizontal size={16} />}
            onClick={logoutAll}
            disabled={loggingOut}
          >
            Logout all accounts
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>

      <Modal
        title="Re-authenticate account"
        opened={showReAuth}
        onClose={closeReauthModal}
        closeOnClickOutside={false}
      >
        <Stack>
          <Text>
            Please enter the secure PIN for{" "}
            <Text span fw={700}>
              {accountName}
            </Text>{" "}
            (
            <Text span fw={700}>
              {accountEmail}
            </Text>
            ) to continue.
          </Text>
          <PinInput
            autoFocus
            label="Enter secure pin"
            length={6}
            mask
            required
            value={reauthPin}
            onChange={setReauthPin}
            onEnterDown={handleReAuth}
            error={Boolean(reauthPin) && reauthPin.length < 6}
            errorMsg={
              Boolean(reauthPin) && reauthPin.length < 6
                ? "Please enter all 6 digits"
                : ""
            }
          />
          <Button
            loading={reAuthenticating}
            disabled={!reauthAccount || reauthPin.length !== 6}
            onClick={handleReAuth}
          >
            Continue
          </Button>
        </Stack>
      </Modal>
    </>
  );
}
