import dayjs from "dayjs";
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

export const expenseSchema = () =>
  yup.object().shape({
    title: yup
      .string()
      .required("Title is required")
      .max(80, "Title can't be longer than 80 characters"),
    description: yup
      .string()
      .nullable()
      .optional()
      .max(400, "Description can't be longer than 400 characters"),
    date: yup
      .date()
      .min(
        dayjs().subtract(7, "days").toDate(),
        "Expense can't be older than 7 days."
      )
      .max(
        dayjs().add(5, "minutes").toDate(),
        "Expense can't be in the future."
      ),
    amount: yup
      .number()
      .nullable()
      .notRequired()
      .typeError("Amount has to be a number"),
    categoryId: yup.string().required("Category is required."),
    addToPlan: yup.boolean(),
    plan: yup
      .string()
      .nullable()
      .when("addToPlan", {
        is: true,
        then: () => yup.string().required("Plan is required"),
        otherwise: () => yup.string().notRequired(),
      }),
    linked: yup.string(),
  });

const expenseSchemaObject = expenseSchema();

export type BudgetForm = yup.InferType<typeof budgetFormSchema>;
export type ExpenseForm = yup.InferType<typeof expenseSchemaObject>;
