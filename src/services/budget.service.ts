import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { MRes } from "./response.type";

export function getBudget(
  params: Pick<IBudget, "month" | "year">
): Promise<MRes<IBudget>> {
  return axios.get(ENDPOINTS.budget, { params }).then((res) => res.data);
}

export function createBudget(
  payload: Partial<IBudget>
): Promise<MRes<undefined>> {
  return axios.post(ENDPOINTS.budget, payload).then((res) => res.data);
}
