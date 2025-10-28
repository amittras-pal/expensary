import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getPlans(open: "true" | "false" = "false") {
  return axios
    .get<ResponseBody<IExpensePlan[]>>(ENDPOINTS.plans, { params: { open } })
    .then((res) => res.data);
}

export function getPlanDetails(_id: string) {
  return axios
    .get<ResponseBody<IExpensePlan>>(ENDPOINTS.planDetails, { params: { _id } })
    .then((res) => res.data);
}

export function deletePlan(_id: string) {
  return axios
    .delete<ResponseBody<undefined>>(ENDPOINTS.plans, { params: { _id } })
    .then((res) => res.data);
}

export function createPlan(payload: Partial<IExpensePlan>) {
  return axios
    .post<ResponseBody<undefined>>(ENDPOINTS.plans, payload)
    .then((res) => res.data);
}

export function updatePlan(payload: Partial<IExpensePlan>) {
  return axios
    .put<ResponseBody<IExpensePlan>>(ENDPOINTS.plans, payload)
    .then((res) => res.data);
}

export function copyExpensesToBudget(data: { expenses: string[] }) {
  return axios.post<ResponseBody<undefined>>(ENDPOINTS.copyExpenses, data);
}
