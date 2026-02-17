import { useEffect } from "react";
import {
  Group,
  GroupProps,
  Menu,
  Modal,
  Text,
  ThemeIcon,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { IconInfoCircle, IconPoint } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { useCurrentUser } from "../../context/user.context";
import { useMediaMatch } from "../../hooks/media-match";
import { updateUserDetails } from "../../services/user.service";
import classes from "../../theme/modules/Layout.module.scss";
import Changelog from "./Changelog";

export default function AppInfo(
  props: Readonly<
    GroupProps & { type: "menu" | "text"; onLinkClick?: () => void }
  >
) {
  const [showVersions, { open, close }] = useDisclosure(false);

  const isMobile = useMediaMatch();
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
      {props.type === "text" && (
        <Group
          {...props}
          gap="xs"
          justify={isMobile ? "flex-start" : "center"}
          w="100%"
        >
          <Text
            component={Link}
            to={userData ? "/about-app" : "/about"}
            td="underline"
            fz="xs"
            c="dimmed"
            onClick={props.onLinkClick}
          >
            About
          </Text>
          <IconPoint size={12} />
          <Text
            td="underline"
            style={{ cursor: "pointer" }}
            fz="xs"
            c="dimmed"
            onClick={open}
          >
            What's New?
          </Text>
        </Group>
      )}
      {props.type === "menu" && (
        <Menu position="right-end">
          <Menu.Target>
            <UnstyledButton className={classes.navBtn} mt={props.mt}>
              <ThemeIcon variant="default" size={36}>
                <IconInfoCircle size={20} />
              </ThemeIcon>
            </UnstyledButton>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item component={Link} to="/about-app">
              About
            </Menu.Item>
            <Menu.Item onClick={open}>What's New</Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
      <Modal
        centered
        onClose={handleClose}
        opened={showVersions}
        closeOnEscape={false}
        closeOnClickOutside={false}
        fullScreen={isMobile}
        size="xl"
        title="What's New in the Latest Version"
      >
        <Changelog />
      </Modal>
    </>
  );
}
