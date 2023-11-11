import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getPlans(
  open: "true" | "false" = "false"
): Promise<ResponseBody<IExpensePlan[]>> {
  return axios
    .get(ENDPOINTS.plans, { params: { open } })
    .then((res) => res.data);
}

export function getPlanDetails(
  _id: string
): Promise<ResponseBody<IExpensePlan>> {
  return axios
    .get(ENDPOINTS.planDetails, { params: { _id } })
    .then((res) => res.data);
}

export function deletePlan(_id: string): Promise<ResponseBody<undefined>> {
  return axios
    .delete(ENDPOINTS.plans, { params: { _id } })
    .then((res) => res.data);
}

export function createPlan(
  payload: Partial<IExpensePlan>
): Promise<ResponseBody<undefined>> {
  return axios.post(ENDPOINTS.plans, payload).then((res) => res.data);
}

export function updatePlan(
  payload: Partial<IExpensePlan>
): Promise<ResponseBody<IExpensePlan>> {
  return axios.put(ENDPOINTS.plans, payload).then((res) => res.data);
}

export function copyExpensesToBudget(data: { expenses: string[] }) {
  return axios.post(ENDPOINTS.copyExpenses, data);
}
