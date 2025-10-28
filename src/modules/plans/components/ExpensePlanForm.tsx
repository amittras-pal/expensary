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
import { DatePickerInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck } from "@tabler/icons-react";
import { yupResolver } from "@hookform/resolvers/yup";
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
    setValue,
    formState: { errors, isValid },
  } = useForm<FormSchema>({
    mode: "onBlur",
    shouldFocusError: true,
    defaultValues: {
      name: data?.name ?? "",
      description: data?.description ?? "",
      executionRange: (data as any)?.executionRange ?? { from: null, to: null },
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

  const handleExecutionRangeChange = (
    val: [Date | string | null, Date | string | null] | null
  ) => {
    const [rawFrom, rawTo] = val || [null, null];
    let from: Date | null = null;
    if (rawFrom instanceof Date) from = rawFrom;
    else if (typeof rawFrom === "string" && rawFrom) from = new Date(rawFrom);

    let to: Date | null = null;
    if (rawTo instanceof Date) to = rawTo;
    else if (typeof rawTo === "string" && rawTo) to = new Date(rawTo);

    setValue("executionRange", { from, to } as any, { shouldValidate: true });
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
      <Divider my="sm" />
      <TextInput
        {...register("name")}
        error={errors.name?.message}
        placeholder="Plan Title"
        label="Plan Title"
        required={true}
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
      <DatePickerInput
        type="range"
        label="Execution Range"
        placeholder="Select start and end date"
        description="You can add/edit expenses outside of this range. This is just a remark indicating when this plan was in effect (e.g. trip start/end)."
        value={(() => {
          const range = watch("executionRange") as any;
          return [range?.from ?? null, range?.to ?? null];
        })()}
        onChange={handleExecutionRangeChange}
        mb="sm"
        error={errors.executionRange?.message as any}
        required={true}
      />
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
