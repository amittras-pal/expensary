export const ENDPOINTS = Object.freeze({
  ping: "/api/wake",
  login: "/api/user/login",
  register: "/api/user/register",
  userInfo: "/api/user/details",
  updateUser: "/api/user/update",
  changePassword: "/api/user/change-password",
  budget: "/api/budget",
  expenses: "/api/expenses",
  summary: "/api/expenses/summary",
  list: "/api/expenses/list",
  search: "/api/expenses/search",
  copyExpenses: "/api/expense-plan/copy-to-budget",
  categories: "/api/categories/get-all",
  plans: "/api/expense-plan",
  planDetails: "/api/expense-plan/details",
  downloadReport: "/api/reports",
  changelog: "/api/changelog",
});
