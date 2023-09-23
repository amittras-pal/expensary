import { Box, Button, Text, createStyles } from "@mantine/core";
import { IconRefresh } from "@tabler/icons-react";
import React, { useEffect } from "react";
import Artwork from "./Artwork";
import { useServerPing } from "./services";
import { useState } from "react";

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: theme.spacing.sm,
    textAlign: "center",
  },
}));

const colors = ["lime", "blue", "green", "yellow", "cyan"];

export default function ServerConnecting({ children }) {
  const { classes } = useStyles();

  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((v) => (v === colors.length - 1 ? 0 : v + 1));
    }, 750);
    return () => clearInterval(interval);
  }, []);

  const { isLoading, isError } = useServerPing({
    staleTime: 20 * 60 * 1000,
    refetchOnWindowFocus: true,
  });

  if (isLoading || isError)
    return (
      <Box className={classes.wrapper}>
        <Artwork color={isLoading ? colors[index] : "red"} />
        <Text fw="bold" color={isLoading ? "indigo" : "red"}>
          {isLoading
            ? "Please wait while we connect to the server..."
            : "Failed to connect to the server!!"}
        </Text>
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
