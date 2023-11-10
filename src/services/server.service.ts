import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function pingServer(): Promise<ResponseBody<undefined>> {
  return axios.get(ENDPOINTS.ping).then((res) => res.data);
}
