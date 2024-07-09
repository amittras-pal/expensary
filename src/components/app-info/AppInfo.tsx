import {
  Group,
  GroupProps,
  Modal,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { useMediaMatch } from "../../hooks/media-match";
import Changelog from "./Changelog";
import { IconPoint } from "@tabler/icons-react";

export default function AppInfo(props: Readonly<GroupProps>) {
  const [changelog, { close, open }] = useDisclosure(false);
  const isMobile = useMediaMatch();
  const { primaryColor } = useMantineTheme();

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
        onClose={close}
        opened={changelog}
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
