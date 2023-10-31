import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { MRes } from "./response.type";

export function pingServer(): Promise<MRes<undefined>> {
  return axios.get(ENDPOINTS.ping).then((res) => res.data);
}
