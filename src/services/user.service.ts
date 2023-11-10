import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getUserData(): Promise<ResponseBody<IUser>> {
  return axios.get(ENDPOINTS.userInfo).then((res) => res.data);
}

export function updateUserDetails(
  payload: Partial<IUser>
): Promise<ResponseBody<IUser>> {
  return axios.put(ENDPOINTS.updateUser, payload).then((res) => res.data);
}
