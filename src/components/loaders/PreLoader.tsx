import {
  Box,
  createStyles,
  Divider,
  Flex,
  Progress,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import { APP_TITLE, time20Min } from "../../constants/app";
import { pingServer } from "../../services/server.service";
import BrandLogo from "./logo-stroke.svg?react";
import BrandLoader from "./LogoLoader";
import "./PreLoader.scss";
import {
  COORDS,
  createPoints,
  drawBackdrop,
  randomIncrememt,
  updatePoints,
} from "./utils";

export default function PreLoader(props: Readonly<PropsWithChildren>) {
  const { colors } = useMantineTheme();

  const [progress, setProgress] = useState(0);

  const backdropRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points: MutableRefObject<COORDS[]> = useRef([]);

  const { classes } = usePreloaderStyles();

  const { isLoading, isError } = useQuery({
    queryKey: ["wake-server"],
    queryFn: pingServer,
    staleTime: time20Min,
    refetchOnWindowFocus: true,
  });

  // ProgressBar increment.
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((v) => v + randomIncrememt());
    }, 500);
    if (isError) clearInterval(progressInterval);
    return () => {
      clearInterval(progressInterval);
    };
  }, [isError]);

  // Backdrop animation.
  useEffect(() => {
    let frameReqId: number;
    const canvas = canvasRef.current;
    const backdrop = backdropRef.current;

    if (canvas && backdrop) {
      canvas.width = backdrop.clientWidth;
      canvas.height = backdrop.clientHeight;
      if (!points.current.length) points.current = createPoints(canvas);

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const animateBackdrop = () => {
          frameReqId = requestAnimationFrame(animateBackdrop);
          if (!isError) {
            ctx.fillStyle = colors.indigo[9];
            ctx.strokeStyle = `${colors.indigo[6]}77`;
            points.current = updatePoints(points.current, {
              w: canvas.width,
              h: canvas.height,
            });
          } else {
            ctx.fillStyle = colors.red[9];
            ctx.strokeStyle = `${colors.red[6]}77`;
          }
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          drawBackdrop(points.current, ctx);
        };
        animateBackdrop();
      }
    }
    return () => cancelAnimationFrame(frameReqId);
  }, [isError]);

  if (isLoading || isError)
    return (
      <>
        <Box className={classes.backdropContainer} ref={backdropRef}>
          <canvas ref={canvasRef} />
        </Box>
        <Box className={classes.logoContainer}>
          <Text align="center" fw="bold" fz="lg" pt="md">
            {APP_TITLE}
          </Text>
          <Divider variant="dashed" my="sm" />
          <Box p="md">
            {isLoading ? (
              <BrandLoader size={200} brand />
            ) : (
              <BrandLogo width={200} height={200} className="logo-error" />
            )}
          </Box>
        </Box>
        <Box className={classes.progressContainer}>
          <Flex align="center" mb="xs" justify="space-between">
            <Text fz="sm" fs="italic">
              Connecting to Server, Please Wait...
            </Text>
            <Tooltip
              w={350}
              multiline
              position="top-end"
              label={
                <Text fz="xs" align="left">
                  The API server is hosted on a free-tier NodeJS hosting
                  platform and might take a while to boot up after being idle
                  for a time. Thank you for your patience!
                </Text>
              }
            >
              <ThemeIcon color="gray" radius={"xl"} variant="light">
                <IconHelp size={16} />
              </ThemeIcon>
            </Tooltip>
          </Flex>
          <Progress
            value={progress}
            color={isError ? "red" : "indigo"}
            sx={{ width: "100%" }}
            size="sm"
          />
          {isError && (
            <Text fz="sm" color="red" fs="italic" mt="xs">
              Failed to connect,
              <Text
                component="span"
                td="underline"
                fw="bold"
                sx={{ cursor: "pointer" }}
                onClick={() => document.location.reload()}
              >
                {" "}
                Refresh
              </Text>
            </Text>
          )}
        </Box>
      </>
    );

  return <>{props.children}</>;
}

const usePreloaderStyles = createStyles((theme) => ({
  backdropContainer: {
    width: "100vw",
    height: "100vh",
    position: "fixed",
    top: 0,
    left: 0,
  },
  logoContainer: {
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -60%)",
    backgroundColor: theme.colors.dark[5],
    boxShadow: theme.shadows.lg,
    borderRadius: theme.radius.lg,
    zIndex: 1000,
  },
  progressContainer: {
    position: "fixed",
    bottom: 0,
    width: "100vw",
    backgroundColor: theme.colors.dark[5],
    boxShadow: theme.shadows.lg,
    borderTopLeftRadius: theme.radius.lg,
    borderTopRightRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    zIndex: 1000,
  },
}));
