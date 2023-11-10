import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getPlans(
  open: boolean = false
): Promise<ResponseBody<IExpensePlan[]>> {
  return axios.get(ENDPOINTS.plans, { params: { open } });
}
