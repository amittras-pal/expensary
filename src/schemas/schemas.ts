import * as yup from "yup";

export const budgetFormSchema = yup.object().shape({
  amount: yup
    .number()
    .typeError("Amount should be a number")
    .required()
    .min(1, "Budget cannot be 0"),
  month: yup.number(),
  year: yup.number(),
});

export type BudgetForm = yup.InferType<typeof budgetFormSchema>;
