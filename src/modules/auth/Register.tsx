import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Divider,
  Loader,
  Stepper,
  Text,
  TextInput,
  Timeline,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconChecks,
  IconLockCheck,
  IconUserQuestion,
} from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PinInput from "../../components/pin-input/PinInput";
import { APP_TITLE } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { RegisterForm, registerSchema } from "../../schemas/schemas";
import { checkUserExists, registerUser } from "../../services/user.service";
import { useAuthStyles } from "../../theme/modules/auth.styles";
import PublicGuard from "../guards/PublicGuard";
import StepNavigation from "./StepNavigation";

export default function Register() {
  const { classes } = useAuthStyles();
  const [active, setActive] = useState(0);
  const isMobile = useMediaMatch();
  const navigate = useNavigate();
  useDocumentTitle(`${APP_TITLE} | Register`);
  const { onError } = useErrorHandler();

  const { mutate: createUser, isLoading: registering } = useMutation({
    mutationFn: registerUser,
    onSuccess: (res) => {
      notifications.show({
        message: res.message,
        color: "green",
        icon: <IconCheck />,
      });
      navigate("/login");
    },
    onError,
  });

  const { mutate: checkEmail, isLoading: checkingEmail } = useMutation({
    mutationFn: checkUserExists,
    onSuccess: () => {
      setActive(1);
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        setError("email", {
          message: err.response?.data.message,
          type: "pattern",
        });
      }
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    watch,
    formState: { errors, isValid },
  } = useForm<RegisterForm>({
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: {
      userName: "",
      email: "",
      pin: 0,
      confirmPin: 0,
      timeZone: new Intl.DateTimeFormat().resolvedOptions().timeZone,
      recoveryChallenge: "",
      recoveryAnswer: "",
    },
    resolver: yupResolver(registerSchema),
  });

  const setFieldValue = (name: keyof RegisterForm, value: string) => {
    setValue(name, value, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleCreate: SubmitHandler<RegisterForm> = (values) => {
    createUser({
      userName: values.userName,
      email: values.email,
      pin: values.pin.toString(),
      timeZone: values.timeZone,
      recoveryChallenge: values.recoveryChallenge,
      recoveryAnswer: values.recoveryAnswer,
    });
  };

  return (
    <PublicGuard>
      <Box
        component="form"
        onSubmit={handleSubmit(handleCreate)}
        className={classes.wrapper}
        autoComplete="off"
      >
        <Text
          fz="lg"
          fw="bold"
          mb="sm"
          sx={{ width: isMobile ? "100%" : "60%" }}
        >
          Create a new {APP_TITLE} Account
        </Text>
        {isMobile && (
          <Timeline
            active={active}
            bulletSize={24}
            lineWidth={2}
            sx={{
              width: isMobile ? "100%" : "60%",
            }}
          >
            <Timeline.Item
              title="Step 1: Basic Info"
              bullet={<IconUserQuestion size={16} />}
            />
            <Timeline.Item
              title="Step 2: Recovery Options"
              bullet={<IconLockCheck size={16} />}
            />
            <Timeline.Item
              title="Step 3: Review & Create Account"
              bullet={<IconChecks size={16} />}
            />
          </Timeline>
        )}

        <Stepper
          active={active}
          breakpoint="sm"
          allowNextStepsSelect={false}
          styles={{
            root: {
              display: "flex",
              flexDirection: "column",
              height: "100%",
              width: isMobile ? "100%" : "60%",
              margin: isMobile ? 0 : "auto",
            },
            steps: {
              display: isMobile ? "none" : "flex",
              padding: "1rem 0rem",
            },
            content: {
              display: "flex",
              flexDirection: "column",
              height: "100%",
            },
          }}
        >
          <Stepper.Step
            label="Step 1"
            description="Basic Info"
            icon={<IconUserQuestion size={18} />}
          >
            <TextInput
              {...register("userName")}
              placeholder="Full Name"
              label="Full Name"
              autoCapitalize="words"
              error={errors?.userName?.message}
              required
              autoFocus
            />
            <TextInput
              value={watch("email")}
              {...register("email")}
              placeholder="Email Address"
              label="Email Address"
              error={errors?.email?.message}
              rightSection={checkingEmail ? <Loader size={24} /> : null}
              required
            />
            <PinInput
              length={6}
              value={watch("pin").toString()}
              onChange={(e) => setFieldValue("pin", e)}
              error={Boolean(errors?.pin?.message)}
              errorMsg={errors?.pin?.message ?? ""}
              label="Create a pin"
              required
            />
            <PinInput
              mask
              length={6}
              value={watch("confirmPin").toString()}
              onChange={(e) => setFieldValue("confirmPin", e)}
              error={Boolean(errors?.confirmPin?.message)}
              errorMsg={errors?.confirmPin?.message ?? ""}
              label="Confirm your pin"
              required
            />
            <StepNavigation
              step={active}
              changeStep={() => checkEmail({ email: watch("email") })}
              nextEnabled={isValid}
            />
          </Stepper.Step>
          <Stepper.Step
            label="Step 2"
            description="Recovery Options"
            icon={<IconLockCheck size={18} />}
          >
            <Text color="dimmed" fz="sm" mb="md">
              A recovery question allows you to recover your account in case you
              get locked out or you forget your password. Make sure the question
              you create is something you can remember easily but is hard to
              guess by anyone else.
            </Text>
            <TextInput
              value={watch("recoveryChallenge")}
              {...register("recoveryChallenge")}
              placeholder="Write a question."
              label="Recovery Question"
              autoComplete="off"
              autoFocus
            />
            <TextInput
              {...register("recoveryAnswer")}
              description="The answer you put here is case sensitive and not recoverable, make sure you remember it."
              label="Answer"
              placeholder="Write an answer"
            />
            <Text color="dimmed" fz="sm" mb="md">
              ** You can set your recovery question from accounts settings later
              as well.
            </Text>
            <StepNavigation
              step={active}
              changeStep={(dir) => setActive((v) => v + dir)}
              nextEnabled={true}
            />
          </Stepper.Step>
          <Stepper.Step
            label="Step 3"
            description="Review & Create Account"
            icon={<IconChecks size={18} />}
          >
            <Divider my="md" />
            <Text mb="md">
              Please review the information you entered and create your account.
            </Text>
            <Text mb="xs" fz="sm">
              <Text component="span" fw="bold">
                Full Name:{" "}
              </Text>
              <Text component="span">{watch("userName")}</Text>
            </Text>
            <Text mb="xs" fz="sm">
              <Text component="span" fw="bold">
                Email Address:{" "}
              </Text>
              <Text component="span">{watch("email")}</Text>
            </Text>
            <Text mb="xs" fz="sm">
              <Text component="span" fw="bold">
                Recovery Question:{" "}
              </Text>
              <Text component="span">{watch("recoveryChallenge")}</Text>
            </Text>
            <Text mb="xs" fz="sm">
              <Text component="span" fw="bold">
                Recovery Answer:{" "}
              </Text>
              <Text component="span">{watch("recoveryAnswer")}</Text>
            </Text>
            <Text mb="xs" fz="sm">
              <Text component="span" fw="bold">
                System Timezone:{" "}
              </Text>
              <Text component="span">{watch("timeZone")}</Text>
            </Text>
            <Text fz="sm" color="dimmed">
              Timezone is required by certain features and is automatically
              detected based on your browser settings and not your geo-location.
            </Text>
            <StepNavigation
              step={active}
              changeStep={(dir) => setActive((v) => v + dir)}
              loading={registering}
            />
          </Stepper.Step>
        </Stepper>
      </Box>
    </PublicGuard>
  );
}
