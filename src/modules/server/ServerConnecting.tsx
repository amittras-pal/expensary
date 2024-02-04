import {
  Box,
  Button,
  Container,
  Group,
  Progress,
  Text,
  ThemeIcon,
  Tooltip,
} from "@mantine/core";
import { IconHelp, IconRefresh } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useState } from "react";
import { blinkColors, time20Min } from "../../constants/app";
import { pingServer } from "../../services/server.service";
import { useConnectorStyles } from "../../theme/modules/connector.styles";
import Artwork from "./Artwork";

type PingerProps = {
  children: JSX.Element;
};

export default function ServerConnecting({ children }: PingerProps) {
  const { classes } = useConnectorStyles();

  const { isLoading, isError } = useQuery({
    queryKey: ["wake-server"],
    queryFn: pingServer,
    staleTime: time20Min,
    refetchOnWindowFocus: true,
  });

  const [ci, setCi] = useState(0);
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const colorsInterval = setInterval(() => {
      setCi((v) => (v === blinkColors.length - 1 ? 0 : v + 1));
    }, 750);
    const progressInterval = setInterval(() => {
      setProgress(
        (v) => v + Math.floor((Math.random() * Math.PI) / 1.6) + 0.07
      );
    }, 500);

    if (isError) clearInterval(progressInterval);

    return () => {
      clearInterval(colorsInterval);
      clearInterval(progressInterval);
    };
  }, [isError]);

  if (isLoading || isError)
    return (
      <Box className={classes.wrapper}>
        <Artwork color={isLoading ? blinkColors[ci] : "red"} />
        <Container sx={{ width: "75%" }} mb="xl">
          <Progress
            value={progress}
            color={isError ? "red" : "indigo"}
            sx={{ width: "100%" }}
            size="sm"
          />
        </Container>
        <Group spacing="xs" noWrap>
          <Text fw="bold" color={isLoading ? "indigo" : "red"}>
            {isLoading
              ? "Connecting to server, please wait..."
              : "Failed to connect to the server!!"}
          </Text>
          <Tooltip
            position="top"
            w={350}
            multiline
            label={
              <Text fz="xs" color="dimmed" align="left">
                The API server is hosted on a free-tier NodeJS hosting platform
                and might take a while to boot up after being idle for a time.
                Thank you for your patience!
              </Text>
            }
          >
            <ThemeIcon color="gray" radius={"xl"} variant="light">
              <IconHelp size={16} />
            </ThemeIcon>
          </Tooltip>
        </Group>
        {isError && (
          <Button
            variant="subtle"
            size="xs"
            color="red"
            leftIcon={<IconRefresh size={14} />}
            onClick={() => document.location.reload()}
          >
            Try Refreshing the Page
          </Button>
        )}
      </Box>
    );

  return children;
}
