import dayjs from "dayjs";
import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody, SummaryResponse } from "./response.type";

export function getSummary(
  plan: boolean | string | null,
  payload?: {
    startDate?: Date;
    endDate?: Date;
  }
) {
  return axios
    .get<ResponseBody<SummaryResponse>>(ENDPOINTS.summary, {
      params: {
        startDate: plan ? null : payload?.startDate,
        endDate: plan ? null : payload?.endDate,
        plan: plan,
      },
    })
    .then((res) => res.data);
}

export function getRecentTransactions(expenseWindow: number) {
  return axios
    .post<ResponseBody<IExpense[]>>(ENDPOINTS.list, {
      startDate: dayjs().subtract(expenseWindow, "days").toDate(),
      endDate: dayjs().toDate(),
      sort: { date: -1 },
    })
    .then((res) => res.data);
}

export function getExpenseList(payload: {
  startDate?: Date;
  endDate?: Date;
  sort: { date: number };
  plan?: string;
}) {
  return axios
    .post<ResponseBody<IExpense[]>>(ENDPOINTS.list, payload)
    .then((res) => res.data);
}

export function createExpense(payload: Partial<IExpense>) {
  return axios
    .post<ResponseBody<undefined>>(ENDPOINTS.expenses, payload)
    .then((res) => res.data);
}

export function editExpense(payload: Partial<IExpense>) {
  return axios
    .put<ResponseBody<IExpense>>(ENDPOINTS.expenses, payload)
    .then((res) => res.data);
}

export function deleteExpense(id: string) {
  return axios
    .delete<ResponseBody<undefined>>(ENDPOINTS.expenses, { params: { id } })
    .then((res) => res.data);
}

export function searchExpenses(payload: ISearchReqBody) {
  return axios
    .post<ResponseBody<IExpense[]>>(ENDPOINTS.search, payload)
    .then((res) => res.data);
}
