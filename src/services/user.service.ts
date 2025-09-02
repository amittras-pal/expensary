import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function loginUser(payload: {
  email: string;
  pin: string;
}): Promise<ResponseBody<IUser>> {
  return axios.post(ENDPOINTS.login, payload).then((res) => res.data);
}

export function registerUser(
  payload: Partial<IUser>
): Promise<ResponseBody<undefined>> {
  return axios.post(ENDPOINTS.register, payload).then((res) => res.data);
}

export function getUserData(): Promise<ResponseBody<IUser>> {
  return axios.get(ENDPOINTS.userInfo).then((res) => res.data);
}

export function updateUserDetails(
  payload: Partial<IUser>
): Promise<ResponseBody<IUser>> {
  return axios.put(ENDPOINTS.updateUser, payload).then((res) => res.data);
}

export function changeUserPassword(payload: {
  email: string;
  currentPin: number;
  newPin: number;
  confirmNewPin: number;
}) {
  return axios
    .post<ResponseBody<undefined>>(ENDPOINTS.changePassword, payload)
    .then((res) => res.data);
}

export function deleteUserAccount(payload: {
  pin: string;
}): Promise<ResponseBody<undefined>> {
  return axios
    .delete(ENDPOINTS.deleteAccount, { data: payload })
    .then((res) => res.data);
}

export function logoutUser() {
  return axios.post<ResponseBody<undefined>>(ENDPOINTS.logout);
}
