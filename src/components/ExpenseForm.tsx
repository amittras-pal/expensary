import { yupResolver } from "@hookform/resolvers/yup";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Select,
  Text,
  Textarea,
  TextInput,
  useMantineTheme,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconCurrencyRupee } from "@tabler/icons-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import React, { useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { time20Min } from "../constants/app";
import { useCurrentUser } from "../context/user.context";
import { useErrorHandler } from "../hooks/error-handler";
import { ExpenseForm as FormSchema, expenseSchema } from "../schemas/schemas";
import { getCategories } from "../services/categories.service";
import { createExpense, editExpense } from "../services/expense.service";
import { getPlans } from "../services/plans.service";
import { ResponseBody } from "../services/response.type";
import CategorySelectItem from "./CategorySelectItem";

interface IExpenseFormProps {
  data: IExpense | null;
  onComplete: (refresh: boolean | IExpense) => void;
}

export default function ExpenseForm({ data, onComplete }: IExpenseFormProps) {
  const { primaryColor } = useMantineTheme();
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();
  const params = useParams();

  const minDate = useMemo(() => {
    const userDate = dayjs(userData?.createdAt).toDate().getTime();
    const oldestAllowed = dayjs().subtract(6, "days").toDate().getTime();
    return dayjs(Math.max(userDate, oldestAllowed)).toDate();
  }, [userData]);

  const handleClose = () => {
    onComplete(false);
    reset();
  };

  const { addToPlan, plan } = useMemo(() => {
    const object = { addToPlan: false, plan: "" };
    if (!!data && data.plan) {
      object.addToPlan = true;
      object.plan = data.plan;
    }

    if (!!params.id) {
      object.addToPlan = true;
      object.plan = params.id;
    }

    return object;
  }, [data, params.id]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<FormSchema>({
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      amount: data?.amount ?? 0,
      categoryId: data?.categoryId ?? "",
      date: data ? dayjs(data.date).toDate() : dayjs().toDate(),
      addToPlan: addToPlan,
      plan: plan,
      linked: data?.linked ?? "",
    },
    resolver: yupResolver(expenseSchema()),
  });

  const setFieldValue = (name: keyof FormSchema, value: string | Date) => {
    setValue(name, value, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSuccess = (res?: ResponseBody<IExpense | undefined>) => {
    notifications.show({
      message: res?.message,
      color: "green",
      icon: <IconCheck />,
    });
    onComplete(res?.response ?? true);
    reset();
  };

  const { data: categoryRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: time20Min,
  });

  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans-list", true],
    queryFn: () => getPlans("true"),
    enabled: watch("addToPlan"),
    refetchOnMount: false,
    onError,
  });

  const { mutate: create, isLoading: creating } = useMutation({
    mutationFn: createExpense,
    onSuccess: handleSuccess,
    onError,
  });

  const { mutate: update, isLoading: editing } = useMutation({
    mutationFn: editExpense,
    onSuccess: handleSuccess,
    onError,
  });

  const handleSave: SubmitHandler<FormSchema> = (values) => {
    // TODO: check why the types for amount & description are incompatible.
    const payload: Partial<IExpense> = Object.assign(
      {},
      {
        ...values,
        amount: values.amount ?? 0,
        description: values.description ?? "",
      }
    );
    // Additiona cleanup.
    if (!values.plan || !values.addToPlan) payload.plan = null;
    if (!values.linked) payload.linked = null;

    if (data?._id) payload._id = data?._id;

    if (data?._id) update(payload);
    else create(payload);
  };

  return (
    <Box
      component="form"
      onReset={handleClose}
      onSubmit={handleSubmit(handleSave)}
    >
      <Text fz="lg" fw="bold" c={primaryColor} mb="sm">
        {data ? "Edit Expense" : "Add a new Expense"}
      </Text>
      <Divider mb="sm" />
      {data?.linked && (
        <Alert color="red" title="Linked Expense" mb="sm">
          This expense is linked to another expense, editing it will also edit
          the other one.
        </Alert>
      )}
      <Box>
        <TextInput
          {...register("title")}
          error={errors?.title?.message}
          placeholder="Expense Title"
          label="Expense Title"
          required
        />
        <Textarea
          {...register("description")}
          placeholder="Expense Description"
          label="Expense Description"
          error={errors.description?.message}
          minRows={5}
        />
        <TextInput
          {...register("amount")}
          error={errors?.amount?.message}
          placeholder="Amount"
          label="Amount"
          inputMode="numeric"
          icon={<IconCurrencyRupee size={18} />}
          onBlur={(e) => {
            if (!e.target.value)
              setValue("amount", 0, {
                shouldTouch: true,
                shouldDirty: true,
                shouldValidate: true,
              });
          }}
          description={`${
            !parseInt(watch("amount")?.toString() ?? "0")
              ? "Keeping 0 as amount will indicate a record type expense."
              : ""
          }`}
        />
        <Select
          searchable
          required
          label="Category"
          placeholder={
            loadingCategories ? "Loading Categories" : "Pick a category"
          }
          disabled={loadingCategories}
          value={watch("categoryId")}
          error={errors.categoryId?.message}
          onChange={(e) => setFieldValue("categoryId", e ?? "")}
          itemComponent={CategorySelectItem}
          data={
            categoryRes?.response?.map((cat) => ({
              ...cat,
              value: cat._id ?? "",
            })) ?? []
          }
        />
        <DateTimePicker
          label="Expense Date"
          placeholder="Select Date"
          minDate={minDate}
          maxDate={dayjs().add(5, "minutes").toDate()}
          value={watch("date")}
          onChange={(e) => setFieldValue("date", e ?? "")}
          error={errors.date?.message}
          required
        />
        <Checkbox
          {...register("addToPlan")}
          label="Add to Plan"
          description={
            data?.linked && !params.id
              ? "Cannot add to plan as it a copied expense."
              : ""
          }
          mb="md"
          disabled={Boolean(!!params.id || data?.linked)}
        />
        {watch("addToPlan") && (
          <Select
            label="Select Plan"
            required
            placeholder={loadingPlans ? "Loading plans" : "Select Plan"}
            disabled={loadingPlans || !!params.id}
            value={watch("plan")}
            error={errors.plan?.message}
            nothingFound={"No Open Plans..."}
            onChange={(e) => setFieldValue("plan", e ?? "")}
            data={
              plansRes?.response?.map((plan) => ({
                label: plan.name,
                value: plan._id ?? "",
              })) ?? []
            }
          />
        )}
      </Box>
      <Group grow>
        <Button type="reset" variant="outline" disabled={creating || editing}>
          Cancel
        </Button>
        <Button type="submit" loading={creating || editing} disabled={!isValid}>
          Save
        </Button>
      </Group>
    </Box>
  );
}
