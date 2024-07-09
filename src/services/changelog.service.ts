import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getChangelog(): Promise<ResponseBody<IReleaseResponse>> {
  return axios.get(ENDPOINTS.changelog).then((res) => res.data);
}
