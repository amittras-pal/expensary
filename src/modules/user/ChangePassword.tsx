import { yupResolver } from "@hookform/resolvers/yup";
import { Button, Divider, Group, Text } from "@mantine/core";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import PinInput from "../../components/pin-input/PinInput";
import { useCurrentUser } from "../../context/user.context";
import { PwdChangeForm, pwdChangeSchema } from "../../schemas/schemas";
import { changeUserPassword } from "../../services/user.service";
import { useErrorHandler } from "../../hooks/error-handler";

export default function ChangePassword() {
  const { userData } = useCurrentUser();
  const client = useQueryClient();
  const navigate = useNavigate();
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

  const { mutate: updatePwd, isLoading } = useMutation({
    mutationFn: changeUserPassword,
    onError,
    onSuccess: () => {
      localStorage.clear();
      client.clear();
      window.dispatchEvent(new Event("storage"));
      navigate("/login");
    },
  });

  const submit: SubmitHandler<PwdChangeForm> = (values) => {
    updatePwd({ ...values, email: values.email ?? "" });
  };

  return (
    <form noValidate onSubmit={handleSubmit(submit)}>
      <Text fz="sm" color="dimmed">
        Please provide the below details to change your pin.
      </Text>
      <Text fz="sm">
        <Text component="span" fw="bold" c="red">
          Note 1:{" "}
        </Text>
        <Text component="span">
          You will be logged out after changing the pin, and would need to login
          again with the new pin.{" "}
        </Text>
      </Text>
      <Text fz="sm" mb="sm">
        <Text component="span" fw="bold" c="red">
          Note 2:{" "}
        </Text>
        <Text component="span">
          If you don't remember your current pin, please logout and reset the
          pin via the 'forgot pin' flow from the login page.
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
      <Group position="right">
        <Button type="submit" disabled={!isValid} loading={isLoading}>
          Change Pin
        </Button>
      </Group>
    </form>
  );
}
