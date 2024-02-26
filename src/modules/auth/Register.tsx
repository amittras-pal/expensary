import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Container,
  Divider,
  Text,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import PinInput from "../../components/pin-input/PinInput";
import { APP_TITLE } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { RegisterForm, registerSchema } from "../../schemas/schemas";
import { registerUser } from "../../services/user.service";
import { useAuthStyles } from "../../theme/modules/auth.styles";
import PublicGuard from "../guards/PublicGuard";

export default function Register() {
  const { classes } = useAuthStyles();
  const navigate = useNavigate();
  useDocumentTitle(`${APP_TITLE} | Register`);
  const { onError } = useErrorHandler();
  const { primaryColor } = useMantineTheme();

  const {
    register,
    handleSubmit,
    setValue,
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
    },
    resolver: yupResolver(registerSchema),
  });

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
    });
  };

  return (
    <PublicGuard>
      <Box
        component="form"
        onSubmit={handleSubmit(handleCreate)}
        className={classes.wrapper}
      >
        <Container size="lg" className={classes.paper}>
          <Text fz="lg" fw="bold" mb="sm">
            Create a new {APP_TITLE} Account
          </Text>
          <Divider mb="sm" />
          <TextInput
            {...register("userName")}
            placeholder="Full Name"
            label="Full Name"
            error={errors?.userName?.message}
            required
            autoFocus
          />
          <TextInput
            {...register("email")}
            placeholder="Email Address"
            label="Email Address"
            error={errors?.email?.message}
            required
          />
          <PinInput
            length={6}
            onChange={(e) => setFieldValue("pin", e)}
            error={Boolean(errors?.pin?.message)}
            errorMsg={errors?.pin?.message ?? ""}
            label="Create a pin"
            required
          />
          <PinInput
            mask
            length={6}
            onChange={(e) => setFieldValue("confirmPin", e)}
            error={Boolean(errors?.confirmPin?.message)}
            errorMsg={errors?.confirmPin?.message ?? ""}
            label="Confirm your pin"
            required
          />
          <Text fz="sm" mb="md" align="center">
            <Text component="span" color="dimmed">
              Detected Time Zone:
            </Text>{" "}
            <Text component="span" fw="bold">
              {watch("timeZone")}
            </Text>
          </Text>
          <Button
            fullWidth
            disabled={!isValid}
            loading={registering}
            type="submit"
            mb="md"
          >
            Create Account
          </Button>
          <Text align="center" c={primaryColor} td="underline">
            <Text component={Link} to="/login">
              Login to existing account.
            </Text>
          </Text>
        </Container>
      </Box>
    </PublicGuard>
  );
}
