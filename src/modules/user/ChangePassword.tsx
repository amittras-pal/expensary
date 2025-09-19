import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Divider, Group, Text } from "@mantine/core";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import PinInput from "../../components/pin-input/PinInput";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useLogoutHandler } from "../../hooks/logout";
import { PwdChangeForm, pwdChangeSchema } from "../../schemas/schemas";
import { changeUserPassword } from "../../services/user.service";

export default function ChangePassword() {
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();
  const {
    handleSubmit,
    formState: { errors, isValid },
    setValue,
  } = useForm<PwdChangeForm>({
    mode: "onSubmit",
    shouldFocusError: true,
    resolver: yupResolver(pwdChangeSchema),
    defaultValues: {
      email: userData?.email ?? "",
      currentPin: 0,
      newPin: 0,
      confirmNewPin: 0,
    },
  });

  const setFieldValue = (name: keyof PwdChangeForm, value: string) => {
    setValue(name, value, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const { logout } = useLogoutHandler();
  const { mutate: updatePwd, isLoading } = useMutation({
    mutationFn: changeUserPassword,
    onError,
    onSuccess: () => logout(),
  });

  const submit: SubmitHandler<PwdChangeForm> = (values) => {
    updatePwd({ ...values, email: values.email ?? "" });
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)}>
      <Text fz="sm" c="dimmed">
        Please provide the below details to change your pin.
      </Text>
      <Text fz="sm" mb="sm">
        <Text component="span" fw="bold" c="red">
          Note:{" "}
        </Text>
        <Text component="span">
          You will be logged out after changing the pin, and would need to login
          again with the new pin.{" "}
        </Text>
      </Text>
      <Divider mb="sm" />
      <PinInput
        required
        mask
        length={6}
        onChange={(e) => setFieldValue("currentPin", e)}
        error={Boolean(errors?.currentPin?.message)}
        errorMsg={errors?.currentPin?.message ?? ""}
        label="Current Pin"
      />
      <PinInput
        required
        length={6}
        onChange={(e) => setFieldValue("newPin", e)}
        error={Boolean(errors?.newPin?.message)}
        errorMsg={errors?.newPin?.message ?? ""}
        label="New Pin"
      />
      <PinInput
        required
        mask
        length={6}
        onChange={(e) => setFieldValue("confirmNewPin", e)}
        error={Boolean(errors?.confirmNewPin?.message)}
        errorMsg={errors?.confirmNewPin?.message ?? ""}
        label="Re-Enter New Pin"
      />
      <Group justify="flex-end">
        <Button type="submit" disabled={!isValid} loading={isLoading}>
          Change Pin
        </Button>
      </Group>
    </form>
  );
}
