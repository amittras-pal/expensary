import {
  MutableRefObject,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Box,
  Divider,
  Progress,
  Text,
  ThemeIcon,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { IconHelp } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { APP_TITLE, _20Min } from "../../constants/app";
import { pingServer } from "../../services/server.service";
import BrandLoader from "./LogoLoader";
import classes from "./PreLoader.module.scss";
import BrandLogo from "./logo-stroke.svg?react";
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

  const { isLoading, isError } = useQuery({
    queryKey: ["wake-server"],
    queryFn: pingServer,
    staleTime: _20Min,
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
        <Box className={classes.backdrop} ref={backdropRef}>
          <canvas ref={canvasRef} />
        </Box>
        <Box className={classes.logoContainer}>
          <Text ta="center" fw="bold" fz="lg" pt="md">
            {APP_TITLE}
          </Text>
          <Divider variant="dashed" my="sm" />
          <Box p="md">
            {isLoading ? (
              <BrandLoader size={200} brand />
            ) : (
              <BrandLogo
                width={200}
                height={200}
                className={classes.logoError}
              />
            )}
          </Box>
        </Box>
        <Box className={classes.progressContainer}>
          <Box
            display="flex"
            mb={"sm"}
            style={{ justifyContent: "space-between", alignItems: "center" }}
          >
            <Text fz="sm" fs="italic">
              Connecting to Server, Please Wait...
            </Text>
            <Tooltip
              w={350}
              multiline
              position="top-end"
              label={
                <>
                  <Text fz="xs" fw="bold" ta="left" fs="italic">
                    Why is it taking so long to load?
                  </Text>
                  <Text fz="xs" ta="left" mt="sm">
                    Our compute engine is hosted on a free-tier platform to save
                    cost. It may take a about a minute to restart after being
                    inactive for a while.
                  </Text>
                  <Text fz="xs" ta="left" mt="sm" fs="italic">
                    Thank you for your patience!!
                  </Text>
                </>
              }
            >
              <ThemeIcon color="gray" radius={"xl"} variant="light">
                <IconHelp size={16} />
              </ThemeIcon>
            </Tooltip>
          </Box>
          <Progress
            size="sm"
            value={progress}
            color={isError ? "red" : "indigo"}
            aria-label="Connection Progress"
          />
          {isError && (
            <Text fz="sm" c="red" fs="italic" mt="xs">
              Failed to connect,
              <Text
                component="span"
                td="underline"
                fw="bold"
                style={{ cursor: "pointer" }}
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
