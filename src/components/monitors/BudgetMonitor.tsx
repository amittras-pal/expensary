import { yupResolver } from "@hookform/resolvers/yup";
import { Box, Button, Divider, Modal, Text, TextInput } from "@mantine/core";
import { useMutation, useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { useErrorHandler } from "../../hooks/error-handler";
import { BudgetForm, budgetFormSchema } from "../../schemas/schemas";
import { createBudget, getBudget } from "../../services/budget.service";
import { getAuthToken } from "../../utils";
import { _20Min } from "../../constants/app";

const BudgetMonitor = () => {
  const { onError } = useErrorHandler();

  const payload = useMemo(
    () => ({
      month: dayjs().month(),
      year: dayjs().year(),
    }),
    []
  );

  const {
    isError,
    isLoading,
    refetch,
    data: budgetRes,
  } = useQuery({
    queryKey: ["budget", payload],
    queryFn: () => getBudget(payload),
    retry: 1,
    enabled: Boolean(getAuthToken()),
    onError,
    staleTime: _20Min,
  });

  const { mutate: create, isLoading: creating } = useMutation({
    mutationFn: createBudget,
    onError,
    onSuccess: () => {
      refetch();
    },
  });

  const { mutate: copyFromPrevious, isLoading: copyingFromPrevious } = useMutation({
    mutationFn: () => {
      const prevMonth = dayjs().subtract(1, 'month');
      const previousMonthPayload = {
        month: prevMonth.month(),
        year: prevMonth.year(),
      };
      return getBudget(previousMonthPayload);
    },
    onError,
    onSuccess: (data) => {
      if (data.response) {
        setValue('amount', data.response.amount);
        setValue('remarks', data.response.remarks || '');
      }
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

  return (
    <Modal
      onClose={() => null}
      opened={Boolean(
        getAuthToken() &&
          !(budgetRes?.response?.amount ?? 0) &&
          !isLoading &&
          isError
      )}
      lockScroll
      closeOnClickOutside={false}
      closeOnEscape={false}
      withCloseButton={false}
    >
      <Box component="form" onSubmit={handleSubmit(handleCreateBudget)}>
        <Text mb="md">
          Your budget for the {dayjs().format("MMM, 'YY")} is not set. Please
          set a budget amount to proceed further.
        </Text>
        <Divider mb="md" />
        <TextInput
          label="Amount"
          placeholder="Amount"
          inputMode="numeric"
          {...register("amount")}
          error={errors.amount?.message}
          autoFocus
        />
        <TextInput
          label="Remarks (optional)"
          placeholder="Add any remarks for this budget"
          {...register("remarks")}
          error={errors.remarks?.message}
          mt="md"
        />
        <Button type="submit" fullWidth disabled={!isValid} loading={creating}>
          Create Budget
        </Button>
        <Button 
          variant="ghost" 
          fullWidth 
          disabled={copyingFromPrevious} 
          loading={copyingFromPrevious}
          onClick={() => copyFromPrevious()}
          mt="sm"
        >
          Copy from {dayjs().subtract(1, 'month').format('MMMM')}
        </Button>
      </Box>
    </Modal>
  );
};

export default BudgetMonitor;
