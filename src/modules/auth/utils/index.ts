import * as yup from "yup";

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
});

export type LoginForm = yup.InferType<typeof loginSchema>;
export type RegisterForm = yup.InferType<typeof registerSchema>;
