import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function initializePasskey(): Promise<ResponseBody<any>> {
  return axios.get(ENDPOINTS.passkeyInit).then((res) => res.data);
}
