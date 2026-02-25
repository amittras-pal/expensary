import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  NumberInput,
  Select,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconChevronRight,
  IconCurrencyRupee,
} from "@tabler/icons-react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmitHandler, useForm } from "react-hook-form";
import CategorySelectItem from "../../components/CategorySelectItem";
import { _20Min, eqSanityRX } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import {
  RecurringExpenseForm as FormSchema,
  recurringExpenseSchema,
} from "../../schemas/schemas";
import { getCategories } from "../../services/categories.service";
import {
  createRecurringExpense,
  updateRecurringExpense,
} from "../../services/recurring-expense.service";
import { groupCategories, roundOff } from "../../utils";

interface RecurringExpenseFormProps {
  data: IRecurringExpense | null;
  onClose: () => void;
}

export default function RecurringExpenseForm({
  data,
  onClose,
}: Readonly<RecurringExpenseFormProps>) {
  const { primaryColor } = useMantineTheme();
  const { onError } = useErrorHandler();
  const client = useQueryClient();
  const [amount, setAmount] = useState<string>(data?.amount?.toString() ?? "0");

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    setError,
    watch,
    formState: { errors, isValid, submitCount },
  } = useForm<FormSchema>({
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      title: data?.title ?? "",
      description: data?.description ?? "",
      amount: data?.amount ?? 0,
      categoryId: data?.categoryId ?? "",
      dayOfMonth: data?.dayOfMonth ?? 1,
    },
    resolver: yupResolver(recurringExpenseSchema),
  });

  const { data: categoryRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: _20Min,
  });

  const handleSuccess = () => {
    notifications.show({
      message: data?._id
        ? "Recurring expense updated."
        : "Recurring expense created.",
      color: "green",
      icon: <IconCheck />,
    });
    client.invalidateQueries(["recurring-expenses"]);
    reset();
    onClose();
  };

  const { mutate: create, isLoading: creating } = useMutation({
    mutationFn: createRecurringExpense,
    onSuccess: handleSuccess,
    onError,
  });

  const { mutate: update, isLoading: updating } = useMutation({
    mutationFn: updateRecurringExpense,
    onSuccess: handleSuccess,
    onError,
  });

  const handleSave: SubmitHandler<FormSchema> = (values) => {
    const payload: Partial<IRecurringExpense> = {
      ...values,
      description: values.description ?? "",
    };

    if (data?._id) {
      payload._id = data._id;
      update(payload);
    } else {
      create(payload);
    }
  };

  const setFieldValue = (name: keyof FormSchema, value: string | number) => {
    setValue(name, value as any, {
      shouldTouch: true,
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const updateAmount = useCallback(
    (e: number) => {
      setValue("amount", roundOff(e), {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    },
    [setValue]
  );

  useEffect(() => {
    if (!amount) return;
    if (RegExp(/[^\d.]/).exec(amount)) {
      const equation = amount.replaceAll(eqSanityRX, "");
      if (equation.length > 0)
        try {
          const finalValue = parseFloat(eval(`"use strict";${equation}`)); //NOSONAR
          updateAmount(finalValue);
        } catch {
          setError("amount", {
            message: "Invalid Expression.",
            type: "pattern",
          });
        }
    } else updateAmount(parseFloat(amount));
  }, [amount, setError, updateAmount]);

  const onAmountBlur = () => {
    if (!amount || amount.length === 0) {
      setAmount("0");
      updateAmount(0);
    } else if (!errors.amount) setAmount(watch("amount")?.toString() ?? "0");
  };

  const categoryOptions = useMemo(() => {
    if (!categoryRes?.response) return [];
    return groupCategories(categoryRes);
  }, [categoryRes?.response]);

  const isBusy = creating || updating;

  return (
    <Box component="form" onSubmit={handleSubmit(handleSave)}>
      <Text fz="lg" fw="bold" c={primaryColor} mb="sm">
        {data?._id ? "Edit Recurring Expense" : "New Recurring Expense"}
      </Text>
      <Divider mb="sm" />
      <Box>
        <TextInput
          {...register("title")}
          error={errors?.title?.message}
          placeholder="Expense Title"
          label="Expense Title"
          autoFocus
          required
        />
        <Textarea
          {...register("description")}
          placeholder="Expense Description"
          label="Expense Description"
          error={errors.description?.message}
          rows={4}
        />
        <TextInput
          error={errors?.amount?.message}
          placeholder="Enter number or calculation"
          label="Amount"
          leftSection={<IconCurrencyRupee size={18} />}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={onAmountBlur}
          required
          description={
            <Text fz="xs" c="dimmed" component="span">
              <IconChevronRight size={8} /> Enter number or calculation. E.g.:
              (a+b*c)/d.
            </Text>
          }
        />
        {categoryRes?.response && (
          <Select
            key={`category-${submitCount}`}
            searchable
            required
            comboboxProps={{ zIndex: 1000 }}
            label="Category"
            placeholder={
              loadingCategories ? "Loading Categories" : "Pick a category"
            }
            disabled={loadingCategories}
            value={watch("categoryId")}
            error={errors.categoryId?.message}
            onChange={(e) => setFieldValue("categoryId", e ?? "")}
            renderOption={CategorySelectItem}
            data={categoryOptions}
          />
        )}
        <NumberInput
          label="Day of Month"
          description="The expense will be created on this day every month (1–28)."
          required
          min={1}
          max={28}
          value={watch("dayOfMonth")}
          onChange={(val) =>
            setFieldValue("dayOfMonth", typeof val === "number" ? val : 1)
          }
          error={errors.dayOfMonth?.message}
        />
      </Box>
      <Group grow mt="md" style={{ flexDirection: "row-reverse" }}>
        <Button type="submit" loading={isBusy} disabled={!isValid}>
          {data?._id ? "Update" : "Create"}
        </Button>
        <Button
          type="button"
          onClick={onClose}
          variant="outline"
          disabled={isBusy}
        >
          Cancel
        </Button>
      </Group>
    </Box>
  );
}
