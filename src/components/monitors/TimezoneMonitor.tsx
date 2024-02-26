import { Box, Button, Group, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconClockCheck, IconClockExclamation } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { updateUserDetails } from "../../services/user.service";

const TimezoneMonitor = () => {
  const { onError } = useErrorHandler();
  const { setUserData, userData } = useCurrentUser();

  const { mutate: updateTZ, isLoading } = useMutation({
    mutationFn: updateUserDetails,
    onError,
    onSuccess: (res) => {
      notifications.hide("tz-change");
      notifications.show({
        title: "Timezone updated successfully!",
        color: "green",
        message: null,
        icon: <IconClockCheck size={16} />,
      });
      setUserData(res.response);
    },
  });

  // TODO: change this to a modal.
  useEffect(() => {
    if (!userData?.timeZone) return;
    const systemTZ = new Intl.DateTimeFormat().resolvedOptions().timeZone;
    const tzOnRecord = userData.timeZone;

    if (tzOnRecord !== systemTZ) {
      notifications.show({
        title: "Timezone Change Detected",
        id: "tz-change",
        autoClose: false,
        color: "red",
        withCloseButton: false,
        icon: <IconClockExclamation size={16} />,
        message: (
          <Box>
            <Text size="sm">
              Your set timezone {tzOnRecord} is different from your browser's
              timezone {systemTZ}. Would you like update your default timezone?
            </Text>
            <Group grow mt="sm">
              <Button
                size="xs"
                variant="outline"
                color="red"
                onClick={() => notifications.hide("tz-change")}
              >
                No
              </Button>
              <Button
                size="xs"
                loading={isLoading}
                onClick={() => updateTZ({ timeZone: systemTZ })}
              >
                Yes!
              </Button>
            </Group>
          </Box>
        ),
      });
    }
  }, [isLoading, updateTZ, userData]);

  return null;
};

export default TimezoneMonitor;
