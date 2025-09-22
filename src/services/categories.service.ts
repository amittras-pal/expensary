import { MantineColor } from "@mantine/core";
import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getCategories() {
  return axios.get<ResponseBody<ICategory[]>>(ENDPOINTS.categories).then((res) => res.data);
}

export function getCategoryGroups() {
  return axios.get<ResponseBody<{ name: string; color: MantineColor; subCategories: number }[]>>(ENDPOINTS.categoryGroups).then((res) => res.data);
}
