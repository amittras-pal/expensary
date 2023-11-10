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

export const loginSchema = yup.object().shape({
  email: yup.string().email("Invalid Email.").required("Email is required."),
  pin: yup
    .number()
    .typeError("Pin should be numeric.")
    .required("Pin is required.")
    .min(100000, "Invalid Pin.")
    .max(999999, "Invalid Pin."),
});

export const registerSchema = yup.object().shape({
  userName: yup.string().required("Name is required"),
  email: yup.string().email("Invalid Email.").required("Email is required."),
  pin: yup
    .number()
    .typeError("Pin should be numeric.")
    .required("Pin is required.")
    .min(100000, "Invalid Pin.")
    .max(999999, "Invalid Pin."),
  confirmPin: yup
    .number()
    .oneOf([yup.ref("pin"), 0], "Pins do not match")
    .required("Please enter pin again"),
  timeZone: yup.string(),
});

export const expensePlanSchema = yup.object().shape({
  name: yup
    .string()
    .required("Plan name is required.")
    .max(40, "Plan name can't exceed 40 characters."),
  description: yup
    .string()
    .required("Plan description is required.")
    .max(400, "Plan description can't exceed 400 characters.")
    .min(20, "Plan description should be 20 characters or longer"),
});

const expenseSchemaObject = expenseSchema();

export type LoginForm = yup.InferType<typeof loginSchema>;
export type RegisterForm = yup.InferType<typeof registerSchema>;
export type BudgetForm = yup.InferType<typeof budgetFormSchema>;
export type ExpenseForm = yup.InferType<typeof expenseSchemaObject>;
export type ExpensePlanForm = yup.InferType<typeof expensePlanSchema>;
