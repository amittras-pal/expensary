import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getBudget(
  params: Pick<IBudget, "month" | "year">
): Promise<ResponseBody<IBudget>> {
  return axios.get(ENDPOINTS.budget, { params }).then((res) => res.data);
}

export function createBudget(
  payload: Partial<IBudget>
): Promise<ResponseBody<undefined>> {
  return axios.post(ENDPOINTS.budget, payload).then((res) => res.data);
}
