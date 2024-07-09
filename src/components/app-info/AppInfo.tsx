import {
  Group,
  GroupProps,
  Modal,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconPoint } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { useEffect } from "react";
import { useCurrentUser } from "../../context/user.context";
import { useMediaMatch } from "../../hooks/media-match";
import { updateUserDetails } from "../../services/user.service";
import Changelog from "./Changelog";

export default function AppInfo(props: Readonly<GroupProps>) {
  const [showVersions, { open, close }] = useDisclosure(false);

  const isMobile = useMediaMatch();
  const { primaryColor } = useMantineTheme();
  const { userData, setUserData } = useCurrentUser();

  useEffect(() => {
    if (userData && userData.seenChangelog === false) open();
    else close();
  }, [userData]);

  const { mutate } = useMutation({
    mutationFn: updateUserDetails,
    onSuccess: () => {
      setUserData((v) => (v !== null ? { ...v, seenChangelog: true } : null));
    },
  });

  const handleClose = () => {
    close();
    if (userData?.seenChangelog === false) mutate({ seenChangelog: true });
  };

  return (
    <>
      <Group {...props} spacing="xs" position="center">
        <Text td="underline" fz="xs" color="dimmed">
          About
        </Text>
        <ThemeIcon size={12} color={primaryColor} variant="default">
          <IconPoint size={12}></IconPoint>
        </ThemeIcon>
        <Text
          td="underline"
          sx={{ cursor: "pointer" }}
          fz="xs"
          color="dimmed"
          onClick={open}
        >
          What's New?
        </Text>
      </Group>
      <Modal
        centered
        onClose={handleClose}
        opened={showVersions}
        closeOnEscape={false}
        closeOnClickOutside={false}
        fullScreen={isMobile}
        size={"xl"}
        title="What's New in the Latest Version"
      >
        <Changelog />
      </Modal>
    </>
  );
}
