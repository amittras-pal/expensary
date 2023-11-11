import dayjs from "dayjs";
import axios from "../config/axios";
import { ENDPOINTS } from "../constants/endpoints";
import { ResponseBody, SummaryResponse } from "./response.type";

export function getSummary(
  plan: boolean | string | null
): Promise<ResponseBody<SummaryResponse>> {
  return axios
    .get(ENDPOINTS.summary, {
      params: {
        firstDay: plan ? null : dayjs().startOf("month").toDate(),
        lastDay: plan ? null : dayjs().endOf("month").toDate(),
        plan: plan,
      },
    })
    .then((res) => res.data);
}

export function getRecentTransactions(): Promise<ResponseBody<IExpense[]>> {
  return axios
    .post(ENDPOINTS.list, {
      startDate: dayjs().subtract(7, "days").toDate(),
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
}): Promise<ResponseBody<IExpense[]>> {
  return axios.post(ENDPOINTS.list, payload).then((res) => res.data);
}

export function createExpense(
  payload: Partial<IExpense>
): Promise<ResponseBody<undefined>> {
  return axios.post(ENDPOINTS.expenses, payload).then((res) => res.data);
}

export function editExpense(
  payload: Partial<IExpense>
): Promise<ResponseBody<IExpense>> {
  return axios.put(ENDPOINTS.expenses, payload).then((res) => res.data);
}

export function deleteExpense(id: string): Promise<ResponseBody<undefined>> {
  return axios
    .delete(ENDPOINTS.expenses, { params: { id } })
    .then((res) => res.data);
}
