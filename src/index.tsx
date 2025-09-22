import React, { lazy } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ReactDOM from "react-dom/client";
import { RouterProvider, createBrowserRouter } from "react-router-dom";
import App from "./App";
import Layout from "./modules/layout/Layout";

const Login = lazy(() => import("./modules/auth/Login"));
const RegistrationHold = lazy(() => import("./modules/auth/RegistrationHold"));
const Expenses = lazy(() => import("./modules/expenses"));
const Home = lazy(() => import("./modules/home"));
const Plans = lazy(() => import("./modules/plans/Plans"));
const PlanDetails = lazy(() => import("./modules/plans/PlanDetails"));
const User = lazy(() => import("./modules/user"));
const ExportExpenses = lazy(() => import("./modules/report/ExportExpenses"));
const GlobalSearch = lazy(() => import("./modules/search/GlobalSearch"));
const About = lazy(() => import("./components/app-info/About"));
const StatsEngine = lazy(() => import("./modules/statistics"));

const root = ReactDOM.createRoot(document.getElementById("root")!);
const client = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false } },
});

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <Layout />,
        children: [
          { path: "/", index: true, element: <Home /> },
          { path: "/home", element: <Home /> },
          { path: "/expenses", element: <Expenses /> },
          { path: "/plans", element: <Plans /> },
          { path: "/plans/:id", element: <PlanDetails /> },
          { path: "/export", element: <ExportExpenses /> },
          { path: "/account", element: <User /> },
          { path: "/search", element: <GlobalSearch /> },
          { path: "/about-app", element: <About /> },
          { path: "/statistics", element: <StatsEngine /> },
        ],
      },
      { path: "/login", element: <Login /> },
      { path: "/register", element: <RegistrationHold /> },
      { path: "/about", element: <About /> },
    ],
  },
]);

root.render(
  <React.StrictMode>
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);
