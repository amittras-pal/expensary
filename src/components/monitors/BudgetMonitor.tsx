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
    refetchOnWindowFocus: false,
    enabled: Boolean(getAuthToken()),
    onError,
  });

  const { mutate: create, isLoading: creating } = useMutation({
    mutationFn: createBudget,
    onError,
    onSuccess: () => {
      refetch();
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm<BudgetForm>({
    mode: "onChange",
    shouldFocusError: true,
    defaultValues: {
      amount: 0,
      month: dayjs().month(),
      year: dayjs().year(),
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
        <Button type="submit" fullWidth disabled={!isValid} loading={creating}>
          Create Budget
        </Button>
      </Box>
    </Modal>
  );
};

export default BudgetMonitor;
