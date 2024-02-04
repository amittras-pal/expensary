import { yupResolver } from "@hookform/resolvers/yup";
import { ActionIcon, Text, TextInput, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconExclamationMark } from "@tabler/icons-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import React, { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useCurrentUser } from "../../context/user.context";
import { ExpenseWindowForm, expenseWindowSchema } from "../../schemas/schemas";
import { updateUserDetails } from "../../services/user.service";

export default function ExpenseWindow() {
  const { userData } = useCurrentUser();

  const {
    formState: { errors, isValid, isDirty },
    register,
    handleSubmit,
    setValue,
  } = useForm<ExpenseWindowForm>({
    defaultValues: { value: 7 },
    shouldFocusError: true,
    mode: "onChange",
    resolver: yupResolver(expenseWindowSchema),
  });

  useEffect(() => {
    setValue("value", userData?.editWindow ?? 0);
  }, [setValue, userData]);

  const client = useQueryClient();
  const { mutate: update, isLoading } = useMutation({
    mutationFn: updateUserDetails,
    onSuccess: (res) => {
      notifications.show({
        message: res?.message,
        color: "green",
        icon: <IconCheck />,
      });

      setTimeout(() => {
        client.invalidateQueries({ queryKey: ["user-info"] });
      }, 1000);
    },
  });

  const updateEditWindow: SubmitHandler<ExpenseWindowForm> = (values) => {
    const payload = { editWindow: values.value };
    update(payload);
  };

  return (
    <form noValidate onSubmit={handleSubmit(updateEditWindow)}>
      <Text fz="sm" color="dimmed" mb="md">
        The Edit Window determines how far behind the current date expenses can
        be added/edited in your record. This will impact the expense
        adding/editing window.
      </Text>
      <TextInput
        {...register("value")}
        required
        label="Expense Edit Window"
        type="number"
        inputMode="numeric"
        description="Value is in days..."
        min={7}
        max={25}
        step={1}
        error={errors?.value?.message}
        rightSection={
          <Tooltip label="Save" color="dark" withArrow position="bottom">
            <ActionIcon
              type="submit"
              color="indigo"
              variant="light"
              disabled={!isDirty}
              loading={isLoading}
            >
              {isValid ? (
                <IconCheck size={16} />
              ) : (
                <IconExclamationMark size={16} />
              )}
            </ActionIcon>
          </Tooltip>
        }
      />
    </form>
  );
}
