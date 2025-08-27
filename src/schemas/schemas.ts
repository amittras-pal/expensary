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
  remarks: yup.string().optional().max(180, "Remarks should be 180 characters or smaller."),
});

export const expenseSchema = (expenseWindow: number) =>
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
        dayjs().subtract(expenseWindow, "days").toDate(),
        `Expense can't be older than ${expenseWindow} days.`
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

export const preferencesSchema = yup.object().shape({
  editWindow: yup
    .number()
    .typeError("Edit window can be between 5-25 days.")
    .required(),
  color: yup.string().required("Please Select a theme color."),
});

export const pwdChangeSchema = yup.object().shape({
  email: yup.string(),
  currentPin: yup
    .number()
    .typeError("Pin should be numeric.")
    .required("Pin is required.")
    .min(100000, "Invalid Pin.")
    .max(999999, "Invalid Pin."),
  newPin: yup
    .number()
    .typeError("Pin should be numeric.")
    .notOneOf([yup.ref("currentPin")], "Old and new pin cannot be same.")
    .required("Pin is required.")
    .min(100000, "Invalid Pin.")
    .max(999999, "Invalid Pin."),
  confirmNewPin: yup
    .number()
    .typeError("Pin should be numeric.")
    .oneOf([yup.ref("newPin"), 0], "Pins do not match")
    .required("Please enter pin again"),
});

export const gSearchSchema = yup.object().shape({
  q: yup.string().optional(),
  dateRange: yup.array().of(yup.date().nullable()).length(2).required(),
  categories: yup.array().of(yup.string().required()),
});

export type LoginForm = yup.InferType<typeof loginSchema>;
export type RegisterForm = yup.InferType<typeof registerSchema>;
export type BudgetForm = yup.InferType<typeof budgetFormSchema>;
export type ExpenseForm = yup.InferType<ReturnType<typeof expenseSchema>>;
export type ExpensePlanForm = yup.InferType<typeof expensePlanSchema>;
export type PreferenceForm = yup.InferType<typeof preferencesSchema>;
export type PwdChangeForm = yup.InferType<typeof pwdChangeSchema>;
export type GlobalSearchForm = yup.InferType<typeof gSearchSchema>;
