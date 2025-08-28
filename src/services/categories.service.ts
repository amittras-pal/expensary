import { MantineColor } from "@mantine/core";
import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getCategories(): Promise<ResponseBody<ICategory[]>> {
  return axios.get(ENDPOINTS.categories).then((res) => res.data);
}

export function getCategoryGroups(): Promise<
  ResponseBody<{ name: string; color: MantineColor; subCategories: number }[]>
> {
  return axios.get(ENDPOINTS.categoryGroups).then((res) => res.data);
}
