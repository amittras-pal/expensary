import { useState } from "react";
import { ActionIcon, Divider, Group, Text, TextInput } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconDeviceFloppy, IconX } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useCurrentUser } from "../../context/user.context";
import { updateUserDetails } from "../../services/user.service";

export default function AccountInfo() {
  const { userData } = useCurrentUser();
  const [editing, setEditing] = useState(false);
  const [userName, setUserName] = useState(userData?.userName ?? "");

  const client = useQueryClient();
  const { mutate: saveUserName, isLoading } = useMutation({
    mutationFn: updateUserDetails,
    onSuccess: (res) => {
      notifications.show({
        message: res?.message,
        color: "green",
        icon: <IconCheck />,
      });
      setEditing(false);
      setTimeout(() => {
        client.clear();
      }, 1000);
    },
  });

  const isDirty = userName.trim() !== "" && userName !== userData?.userName;

  return (
    <>
      {editing ? (
        <Group gap="xs" mb="xs" align="center">
          <TextInput
            value={userName}
            onChange={(e) => setUserName(e.currentTarget.value)}
            fz="1.5rem"
            fw="bold"
            autoFocus
            mb={0}
            style={{ flex: 1 }}
          />
          <ActionIcon
            variant="light"
            color="green"
            disabled={!isDirty}
            loading={isLoading}
            size="input-md"
            onClick={() => saveUserName({ userName: userName.trim() })}
          >
            <IconDeviceFloppy size={18} />
          </ActionIcon>
          <ActionIcon
            variant="light"
            color="red"
            disabled={isLoading}
            size="input-md"
            onClick={() => setEditing(false)}
          >
            <IconX size={18} />
          </ActionIcon>
        </Group>
      ) : (
        <Text
          fz="1.5rem"
          fw="bold"
          fs="italic"
          mb="xs"
          style={{ cursor: "pointer" }}
          onClick={() => {
            setUserName(userData?.userName ?? "");
            setEditing(true);
          }}
        >
          {userData?.userName}
        <Text fz="xs" fs="italic" c="dimmed" ml="xs" component="span">
          (Click to edit)
        </Text>
        </Text>
      )}
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
      </>
  );
}
