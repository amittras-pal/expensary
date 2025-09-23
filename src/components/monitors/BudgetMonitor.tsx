import { useMemo } from "react";
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Text,
  TextInput,
} from "@mantine/core";
import { yupResolver } from "@hookform/resolvers/yup";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { SubmitHandler, useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { _20Min } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { BudgetForm, budgetFormSchema } from "../../schemas/schemas";
import { createBudget, getBudget } from "../../services/budget.service";
import { isLoggedIn } from "../../utils";

const BudgetMonitor = () => {
  const { onError } = useErrorHandler();

  const currentMonthPayload = useMemo(
    () => ({
      month: dayjs().month(),
      year: dayjs().year(),
    }),
    []
  );
  const previousMonthPayload = useMemo(() => {
    const prevMonth = dayjs().subtract(1, "month");
    return {
      month: prevMonth.month(),
      year: prevMonth.year(),
    };
  }, []);

  const {
    isError: currentMonthError,
    isLoading: loadingCurrentMonth,
    refetch: reloadCurrentMonth,
    data: currentMonthRes,
  } = useQuery({
    queryKey: ["budget", currentMonthPayload],
    queryFn: () => getBudget(currentMonthPayload),
    retry: 1,
    enabled: Boolean(isLoggedIn()),
    onError,
    staleTime: _20Min,
  });

  const {
    isError: previousMonthError,
    isLoading: loadingPreviousMonth,
    data: previousMonthRes,
  } = useQuery({
    queryKey: ["budget-previous", previousMonthPayload],
    queryFn: () => getBudget(previousMonthPayload),
    retry: 1,
    enabled: Boolean(isLoggedIn()),
    // onError,
    staleTime: _20Min,
  });

  const { mutate: create, isLoading: creating } = useMutation({
    mutationFn: createBudget,
    onError,
    onSuccess: () => {
      reloadCurrentMonth();
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isValid },
  } = useForm<BudgetForm>({
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      amount: 0,
      month: dayjs().month(),
      year: dayjs().year(),
      remarks: "",
    },
    resolver: yupResolver(budgetFormSchema),
  });

  const handleCreateBudget: SubmitHandler<BudgetForm> = (values) => {
    create(values);
  };

  const copyFromPrevious = () => {
    setValue("amount", previousMonthRes?.response.amount ?? 0);
    setValue("remarks", previousMonthRes?.response.remarks ?? "", {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  return (
    <Modal
      onClose={() => null}
      opened={Boolean(
        isLoggedIn() &&
          !(currentMonthRes?.response?.amount ?? 0) &&
          !loadingCurrentMonth &&
          currentMonthError
      )}
      lockScroll
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Box component="form" onSubmit={handleSubmit(handleCreateBudget)}>
        <Text mb="md">
          Please create a budget for {dayjs().format("MMMM YYYY")} to continue
          with the app.
        </Text>
        <Divider mb="md" />
        <TextInput
          label="Amount"
          placeholder="Amount"
          inputMode="numeric"
          {...register("amount")}
          error={errors.amount?.message}
          autoFocus
          required
        />
        <TextInput
          label="Remarks"
          placeholder="Add any remarks for this budget"
          {...register("remarks")}
          error={errors.remarks?.message}
          mt="md"
        />
        <Group grow style={{ flexDirection: "row-reverse" }}>
          <Button type="submit" disabled={!isValid} loading={creating}>
            Save
          </Button>
          <Button
            variant="outline"
            onClick={copyFromPrevious}
            disabled={previousMonthError || loadingPreviousMonth}
          >
            Copy from {dayjs().subtract(1, "month").format("MMMM")}
          </Button>
        </Group>
        {(previousMonthError || !previousMonthRes?.response.amount) && (
          <Text c="dimmed" fz="xs" fs="italic" mt="sm">
            <Text component="span" c="red">
              *{" "}
            </Text>
            <Text component="span" c="white">
              No previous budget found.
            </Text>
            <br />
            This may be your first month or last month&rsquo;s budget was not
            created. If you missed a budget, contact the developer via the{" "}
            <Text component={Link} to="/about-app" td="underline">
              About page
            </Text>{" "}
            to get a dummy budget. Auto-creation isn&rsquo;t supported at this
            time.
          </Text>
        )}
      </Box>
    </Modal>
  );
};

export default BudgetMonitor;
