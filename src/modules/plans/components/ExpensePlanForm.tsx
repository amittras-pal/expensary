import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Divider,
  Group,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { useMutation } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import { useErrorHandler } from "../../../hooks/error-handler";
import {
  ExpensePlanForm as FormSchema,
  expensePlanSchema,
} from "../../../schemas/schemas";
import { createPlan, updatePlan } from "../../../services/plans.service";
import { ResponseBody } from "../../../services/response.type";

interface IExpensePlanFormProps {
  data?: IExpensePlan | null;
  onComplete: (e: IExpensePlan | boolean) => void;
}

export default function ExpensePlanForm({
  data,
  onComplete,
}: Readonly<IExpensePlanFormProps>) {
  const { primaryColor } = useMantineTheme();
  const { onError } = useErrorHandler();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid },
  } = useForm<FormSchema>({
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
    },
    resolver: yupResolver(expensePlanSchema),
  });

  const handleSuccess = (res: ResponseBody<IExpensePlan | undefined>) => {
    notifications.show({
      message: res.message,
      color: "green",
      icon: <IconCheck />,
    });
    onComplete(res.response ?? true);
    reset();
  };

  const { mutate: create, isLoading: creating } = useMutation({
    mutationFn: createPlan,
    onSuccess: handleSuccess,
    onError,
  });

  const { mutate: update, isLoading: updating } = useMutation({
    mutationFn: updatePlan,
    onSuccess: handleSuccess,
    onError,
  });

  const handleClose = () => {
    onComplete(false);
    reset();
  };

  const handleSave: SubmitHandler<FormSchema> = (values) => {
    const payload: Partial<IExpensePlan> = { ...values };
    if (data) update({ ...payload, _id: data._id, open: true });
    else create(payload);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(handleSave)}
      onReset={handleClose}
    >
      <Text fz="lg" fw="bold" c={primaryColor} mb="sm">
        {data ? "Edit Plan" : "Create New Plan"}
      </Text>
      <Divider />
      <Box>
        <TextInput
          {...register("name")}
          error={errors.name?.message}
          placeholder="Plan Title"
          label="Plan Title"
          required
        />
        <Textarea
          {...register("description")}
          error={errors.description?.message}
          placeholder="Plan Description"
          label="Plan Description"
          minRows={5}
          required
        />
        <Text size="xs" c="dimmed" ta="right">
          {watch("description")?.length} / 400
        </Text>
      </Box>
      <Group grow mt="md" style={{ flexDirection: "row-reverse" }}>
        <Button
          type="submit"
          loading={creating || updating}
          disabled={!isValid}
        >
          Save
        </Button>
        <Button type="reset" variant="outline" disabled={creating || updating}>
          Cancel
        </Button>
      </Group>
    </Box>
  );
}
