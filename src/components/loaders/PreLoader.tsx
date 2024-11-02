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
import { useMediaMatch } from "../../hooks/media-match";
import { pingServer } from "../../services/server.service";
import BrandLogo from "./logo-stroke.svg?react";
import BrandLoader from "./LogoLoader";
import "./PreLoader.scss";
import { COORDS, createPoints, drawBackdrop, updatePoints } from "./utils";

export default function PreLoader(props: Readonly<PropsWithChildren>) {
  const { colors } = useMantineTheme();
  const isMobile = useMediaMatch();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const points: MutableRefObject<COORDS[]> = useRef([]);

  const { classes } = usePreloaderStyles();

  const { isLoading, isError } = useQuery({
    queryKey: ["wake-server"],
    queryFn: pingServer,
    staleTime: time20Min,
    refetchOnWindowFocus: true,
  });
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress(
        (v) => v + Math.floor((Math.random() * Math.PI) / 1.6) + 0.07
      );
    }, 500);

    if (isError) clearInterval(progressInterval);

    return () => {
      clearInterval(progressInterval);
    };
  }, [isError]);

  useEffect(() => {
    let frameReqId: number;
    const canvas = canvasRef.current;

    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (!points.current.length) points.current = createPoints(canvas);

      const ctx = canvas.getContext("2d");
      if (ctx) {
        const animateBackdrop = () => {
          frameReqId = requestAnimationFrame(animateBackdrop);
          if (!isError) {
            ctx.fillStyle = `${colors.indigo[9]}aa`;
            ctx.strokeStyle = `${colors.indigo[6]}77`;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            points.current = updatePoints(points.current, [
              canvas.width,
              canvas.height,
            ]);
            drawBackdrop(points.current, ctx);
          } else {
            ctx.fillStyle = `${colors.red[9]}aa`;
            ctx.strokeStyle = `${colors.red[6]}77`;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawBackdrop(points.current, ctx);
          }
        };
        animateBackdrop();
      }
    }
    return () => cancelAnimationFrame(frameReqId);
  }, [isMobile, isError]);

  if (isLoading || isError)
    return (
      <>
        <canvas ref={canvasRef} />
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
          <Flex gap="xs" align="center" mb="xs" justify="space-between">
            <Text fz="sm" fs="italic">
              Connecting to Server, Please Wait...
            </Text>
            <Tooltip
              w={350}
              multiline
              position="top-end"
              label={
                <Text fz="xs" color="dimmed" align="left">
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
