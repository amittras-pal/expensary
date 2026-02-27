import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody } from "./response.type";

export function getRecurringExpenses() {
  return axios
    .get<ResponseBody<IRecurringExpense[]>>(ENDPOINTS.recurringExpenses)
    .then((res) => res.data);
}

export function createRecurringExpense(payload: Partial<IRecurringExpense>) {
  return axios
    .post<ResponseBody<undefined>>(ENDPOINTS.recurringExpenses, payload)
    .then((res) => res.data);
}

export function updateRecurringExpense(payload: Partial<IRecurringExpense>) {
  return axios
    .put<ResponseBody<undefined>>(ENDPOINTS.recurringExpenses, payload)
    .then((res) => res.data);
}

export function deleteRecurringExpense(id: string) {
  return axios
    .delete<ResponseBody<undefined>>(ENDPOINTS.recurringExpenses, {
      params: { id },
    })
    .then((res) => res.data);
}

export function processRecurringExpenses() {
  return axios
    .post<ResponseBody<number>>(ENDPOINTS.processRecurringExpenses)
    .then((res) => res.data);
}
