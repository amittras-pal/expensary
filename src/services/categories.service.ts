import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { MRes } from "./response.type";

export function getCategories(): Promise<MRes<ICategory[]>> {
  return axios.get(ENDPOINTS.categories).then((res) => res.data);
}
