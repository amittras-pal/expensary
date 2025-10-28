import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function pingServer() {
  return axios
    .get<ResponseBody<undefined>>(ENDPOINTS.ping)
    .then((res) => res.data);
}
