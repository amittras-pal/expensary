import {
  Container,
  Divider,
  Group,
  Paper,
  Text,
  Title
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import dayjs from "dayjs";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import ChangePassword from "./ChangePassword";
import Preferences from "./Preferences";

export default function User() {
  useDocumentTitle(`${APP_TITLE} | My Account`);

  const { userData } = useCurrentUser();

  return (
    <Container
      size={"lg"}
      style={{ display: "flex", flexDirection: "column", gap: 16 }}
    >
      <Paper withBorder p="md" radius="md">
        <Title order={4} mb="xs">
          Account Info
        </Title>
        <Text fz="2rem" fw="bold" fs="italic" mb="xs">
          {userData?.userName}
        </Text>
        <Group gap="sm" wrap="wrap">
          <Text component="p" m={0} fz="xs">
            <Text component="span" c="dimmed">
              Member Since:{" "}
            </Text>
            <Text component="span" fw="bold">
              {dayjs(userData?.createdAt).format("DD MMM 'YY")}
            </Text>
          </Text>
          {userData?.createdAt !== userData?.updatedAt && (
            <>
              <Divider orientation="vertical" color={userData?.color} />
              <Text component="p" m={0} fz="xs">
                <Text component="span" c="dimmed">
                  Last Updated:{" "}
                </Text>
                <Text component="span" fw="bold">
                  {dayjs(userData?.updatedAt).format("DD MMM' YY")}
                </Text>
              </Text>
            </>
          )}
        </Group>
      </Paper>
      <Paper withBorder p="md" radius="md">
        <Title order={3} mb="xs">
          Change Pin
        </Title>
        <ChangePassword />
      </Paper>
      <Paper withBorder p="md" radius="md">
        <Title order={3} mb="xs">
          Preferences
        </Title>
        <Preferences />
      </Paper>
    </Container>
  );
}
