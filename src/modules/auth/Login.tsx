import { useState } from "react";
import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Group,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useDocumentTitle, useLocalStorage } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import AppInfo from "../../components/app-info/AppInfo";
import PinInput from "../../components/pin-input/PinInput";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { LoginForm, loginSchema } from "../../schemas/schemas";
import { loginUser } from "../../services/user.service";
import classes from "../../theme/modules/auth.module.scss";
import PublicGuard from "../guards/PublicGuard";

export default function Login() {
  const { setUserData } = useCurrentUser();
  const navigate = useNavigate();
  const [target, setTarget] = useState("/");
  useDocumentTitle(`${APP_TITLE} | Login`);
  const { onError } = useErrorHandler();
  const { primaryColor } = useMantineTheme();
  const [, setPrimaryColor] = useLocalStorage({ key: "primary-color" });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<LoginForm>({
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: {
      email: "",
      pin: 0,
    },
    resolver: yupResolver(loginSchema),
  });

  const { mutate: login, isLoading: loggingIn } = useMutation({
    mutationFn: loginUser,
    onSuccess: (res) => {
      localStorage.setItem("isAuthenticated", "true");
      setPrimaryColor(res.response.color);
      setUserData(res?.response);
      notifications.show({
        title: res.message,
        message: `Welcome, ${res.response.userName}`,
        color: "green",
        icon: <IconCheck />,
      });
      navigate(target);
    },
    onError,
  });

  const handleLogin: SubmitHandler<LoginForm> = (values) => {
    login({ email: values.email, pin: values.pin.toString() });
  };

  return (
    <PublicGuard>
      <Box
        component="form"
        onSubmit={handleSubmit(handleLogin)}
        className={classes.wrapper}
      >
        <Container size="lg" className={classes.paper}>
          <Text fz="lg" fw="bold" mb="sm">
            Login to your {APP_TITLE} Account
          </Text>
          <Divider mb="sm" />
          <TextInput
            {...register("email")}
            placeholder="Email Address"
            label="Email Address"
            error={errors?.email?.message}
            required
            autoFocus
          />
          <PinInput
            length={6}
            mask
            onEnterDown={handleSubmit(handleLogin)}
            onChange={(e) =>
              setValue("pin", Number.parseInt(e), {
                shouldTouch: true,
                shouldDirty: true,
                shouldValidate: true,
              })
            }
            error={Boolean(errors?.pin?.message)}
            errorMsg={errors?.pin?.message ?? ""}
            label="Secure Pin"
            required
          />
          <Text fw="bold" mb="sm">
            Login To:{" "}
          </Text>
          <Chip.Group
            onChange={(e) => setTarget(Array.isArray(e) ? e[0] : e)}
            value={target}
          >
            <Group justify="center" gap="xs" mb="md">
              <Chip variant="filled" size="xs" value="/">
                Home
              </Chip>
              <Chip variant="filled" size="xs" value="/expenses">
                Transactions
              </Chip>
              <Chip variant="filled" size="xs" value="/statistics">
                Statistics
              </Chip>
              <Chip variant="filled" size="xs" value="/search">
                Search
              </Chip>
              <Chip variant="filled" size="xs" value="/plans">
                Plans
              </Chip>
              <Chip variant="filled" size="xs" value="/export">
                Export
              </Chip>
              <Chip variant="filled" size="xs" value="/account">
                Account
              </Chip>
            </Group>
          </Chip.Group>
          <Button
            fullWidth
            disabled={!isValid}
            loading={loggingIn}
            type="submit"
            mb="md"
          >
            Login
          </Button>
          <Text ta="center" c={primaryColor} td="underline">
            <Text component={Link} to="/register">
              Create a new Account
            </Text>
          </Text>
        </Container>
        <AppInfo mt="auto" type="text" />
      </Box>
    </PublicGuard>
  );
}
