import { Divider, Group, Paper, Text, Title } from "@mantine/core";
import dayjs from "dayjs";
import { useCurrentUser } from "../../../context/user.context";

const AccountInfo = () => {
  const { userData } = useCurrentUser();

  return (
    <Paper withBorder p="md" radius="md" mb="lg">
      <Title order={4} mb="md">Account Info</Title>
      <Text fz="2rem" fw="bold">
        {userData?.userName}
      </Text>
      <Group spacing="sm">
        <Text component="p" m={0} fz="xs">
          <Text component="span" color="dimmed">
            Member Since:{" "}
          </Text>
          <Text component="span" fw="bold">
            {dayjs(userData?.createdAt).format("DD MMM 'YY")}
          </Text>
        </Text>
        {userData?.createdAt !== userData?.updatedAt && (
          <>
            <Divider
              orientation="vertical"
              variant="solid"
              color={userData?.color}
            />
            <Text component="p" m={0} fz="xs">
              <Text component="span" color="dimmed">
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
  );
};

export default AccountInfo;
