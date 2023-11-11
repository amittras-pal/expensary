export type ResponseBody<T> = {
  message: string;
  response: T;
};

export type SummaryResponse = {
  summary: Record<string, SummaryItem>;
  total: number;
};
