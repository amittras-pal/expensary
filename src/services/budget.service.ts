import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getBudget(
  params: Pick<IBudget, "month" | "year">
) {
  return axios.get<ResponseBody<IBudget>>(ENDPOINTS.budget, { params }).then((res) => res.data);
}

export function createBudget(
  payload: Partial<IBudget>
) {
  return axios.post<ResponseBody<undefined>>(ENDPOINTS.budget, payload).then((res) => res.data);
}
