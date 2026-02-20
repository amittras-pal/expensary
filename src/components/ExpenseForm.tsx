import {
  FocusEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Divider,
  Group,
  Select,
  Text,
  TextInput,
  Textarea,
  useMantineTheme,
} from "@mantine/core";
import { DateTimePicker } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import {
  IconCheck,
  IconChevronRight,
  IconCurrencyRupee,
} from "@tabler/icons-react";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { SubmitHandler, useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { _20Min, eqSanityRX } from "../constants/app";
import { useCurrentUser } from "../context/user.context";
import { useErrorHandler } from "../hooks/error-handler";
import { useMediaMatch } from "../hooks/media-match";
import { ExpenseForm as FormSchema, expenseSchema } from "../schemas/schemas";
import { getCategories } from "../services/categories.service";
import { createExpense, editExpense } from "../services/expense.service";
import { getPlansLite } from "../services/plans.service";
import { ResponseBody } from "../services/response.type";
import { groupCategories, roundOff } from "../utils";
import CategorySelectItem from "./CategorySelectItem";

interface IExpenseFormProps {
  data: IExpense | null;
  onComplete: (refresh: boolean | IExpense) => void;
}

export default function ExpenseForm({
  data,
  onComplete,
}: Readonly<IExpenseFormProps>) {
  const { primaryColor } = useMantineTheme();
  const isMobile = useMediaMatch();
  const { userData } = useCurrentUser();
  const { onError } = useErrorHandler();
  const params = useParams();
  const [amount, setAmount] = useState<string>(data?.amount.toString() ?? "0");
  const [addMore, setAddMore] = useState(false);

  const minDate = useMemo(() => {
    const userDate = dayjs(userData?.createdAt).toDate().getTime();
    const oldestAllowed = dayjs()
      .subtract(userData?.editWindow ? userData.editWindow - 1 : 6, "days")
      .toDate()
      .getTime();
    return dayjs(Math.max(userDate, oldestAllowed)).toDate();
  }, [userData]);

  const handleClose = () => {
    onComplete(addMore);
    reset();
  };

  const { addToPlan, plan } = useMemo(() => {
    const object = { addToPlan: false, plan: "" };
    if (!!data && data.plan) {
      object.addToPlan = true;
      object.plan = data.plan;
    }

    if (typeof params.id === "string") {
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
    setError,
    watch,
    setFocus,
    formState: { errors, isValid, submitCount },
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
    resolver: yupResolver(expenseSchema(userData?.editWindow ?? 7)),
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
    if (addMore) {
      setAmount("0");
      setFocus("title");
    } else {
      onComplete(res?.response ?? true);
    }
    reset();
  };

  const { data: categoryRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: _20Min,
  });

  const { data: plansRes, isLoading: loadingPlans } = useQuery({
    queryKey: ["plans-list-lite", true],
    queryFn: () => getPlansLite("true"),
    enabled: watch("addToPlan"),
    refetchOnMount: false,
    staleTime: _20Min,
    onError,
    onSuccess: (res) => {
      if (res?.response?.length === 1) setValue("plan", res.response[0]._id);
    },
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
    const payload: Partial<IExpense> = {
      ...values,
      amount: values.amount ?? 0,
      description: values.description ?? "",
    };
    if (!values.plan || !values.addToPlan) payload.plan = null;
    if (!values.linked) payload.linked = null;

    if (data?._id) payload._id = data?._id;

    if (data?._id) update(payload);
    else create(payload);
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
          // Skipping sonar test here is fine.
          // The expression going into 'eval' is sanitized with a strict regex
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

  const onAmountBlur: FocusEventHandler<HTMLInputElement> = (e) => {
    if (e.target.value.length === 0) {
      setAmount("0");
      updateAmount(0);
    } else if (!errors.amount) setAmount(watch("amount")?.toString() ?? "0");
  };

  const categoryOptions = useMemo(() => {
    if (!categoryRes?.response) return [];
    return groupCategories(categoryRes);
  }, [categoryRes?.response]);

  return (
    <Box component="form" onSubmit={handleSubmit(handleSave)}>
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
          rows={6}
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
            <>
              <Text fz="xs" c="dimmed" component="span">
                <IconChevronRight size={8} /> Enter number or calculation. E.g.:
                (a+b*c)/d.
              </Text>
              <br />
              <Text fz="xs" c="dimmed" component="span">
                <IconChevronRight size={8} /> Keeping '0' indicates an expense
                where money wasn't spent.
              </Text>
            </>
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
        <DateTimePicker
          label="Expense Date"
          dropdownType={isMobile ? "modal" : "popover"}
          modalProps={{ withinPortal: true, zIndex: 2000, returnFocus: true }}
          popoverProps={{ withinPortal: true, zIndex: 2000, returnFocus: true }}
          placeholder="Select Date"
          minDate={minDate}
          maxDate={dayjs().add(5, "minutes").toDate()}
          value={watch("date")}
          onChange={(e) => setFieldValue("date", e ?? "")}
          error={errors.date?.message}
          required
        />
        <Group justify="space-between" mb="md">
          <Checkbox
            {...register("addToPlan")}
            label="Add to Plan"
            description={
              data?.linked && !params.id
                ? "Cannot add to plan as it a copied expense."
                : ""
            }
            disabled={Boolean(!!params.id || data?.linked)}
          />
          {data === null && (
            <Checkbox
              label="Add another"
              checked={addMore}
              onChange={(e) => setAddMore(e.target.checked)}
            />
          )}
        </Group>
        {watch("addToPlan") && (
          <Select
            key={`plan-${submitCount}`}
            label="Select Plan"
            required
            comboboxProps={{ zIndex: 1000 }}
            placeholder={loadingPlans ? "Loading plans" : "Select Plan"}
            disabled={loadingPlans || !!params.id}
            value={watch("plan")}
            error={errors.plan?.message}
            nothingFoundMessage={"No Open Plans..."}
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
      <Group grow style={{ flexDirection: "row-reverse" }}>
        <Button type="submit" loading={creating || editing} disabled={!isValid}>
          Save
        </Button>
        <Button
          type="button"
          onClick={handleClose}
          variant="outline"
          disabled={creating || editing}
        >
          Cancel
        </Button>
      </Group>
    </Box>
  );
}
