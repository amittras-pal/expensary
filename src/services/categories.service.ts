import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getCategories(): Promise<ResponseBody<ICategory[]>> {
  return axios.get(ENDPOINTS.categories).then((res) => res.data);
}
