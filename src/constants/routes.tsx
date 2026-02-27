import {
  IconArrowsDoubleSwNe,
  IconChartHistogram,
  IconDashboard,
  IconDatabaseExport,
  IconReport,
  IconSearch,
  IconUserCog,
} from "@tabler/icons-react";

export const ROUTES: RouteItem[] = [
  {
    icon: IconDashboard,
    label: "Dashboard",
    path: "/home",
    exactMatch: true,
    shortcut: "D",
  },
  {
    icon: IconArrowsDoubleSwNe,
    label: "All Transactions",
    path: "/expenses",
    exactMatch: true,
    shortcut: "L",
  },
  {
    icon: IconChartHistogram,
    label: "Spend Statistics",
    path: "/statistics",
    exactMatch: true,
    shortcut: "T",
  },
  {
    icon: IconSearch,
    label: "Search Expenses",
    path: "/search",
    exactMatch: false,
    shortcut: "S",
  },
  {
    icon: IconReport,
    label: "Vacations & Plans",
    path: "/plans",
    exactMatch: false,
    shortcut: "P",
  },
  {
    icon: IconDatabaseExport,
    label: "Export Expenses",
    path: "/export",
    exactMatch: false,
    shortcut: "E",
  },
  {
    icon: IconUserCog,
    label: "My Account",
    path: "/account",
    exactMatch: false,
    shortcut: "U",
  },
];
