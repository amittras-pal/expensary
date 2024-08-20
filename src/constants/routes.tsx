import {
  IconArrowsDoubleSwNe,
  IconDashboard,
  IconDatabaseExport,
  IconReport,
  IconSearch,
  IconUserCog,
} from "@tabler/icons-react";

export const ROUTES: RouteItem[] = [
  {
    icon: <IconDashboard size={16} />,
    label: "Dashboard",
    path: "/",
    exactMatch: true,
    shortcut: "D",
  },
  {
    icon: <IconArrowsDoubleSwNe size={16} />,
    label: "Expenses List",
    path: "/expenses",
    exactMatch: true,
    shortcut: "L",
  },
  {
    icon: <IconSearch size={16} />,
    label: "Search Expenses",
    path: "/search",
    exactMatch: false,
    shortcut: "S",
  },
  {
    icon: <IconReport size={16} />,
    label: "Vacations & Plans",
    path: "/plans",
    exactMatch: false,
    shortcut: "P",
  },
  {
    icon: <IconDatabaseExport size={16} />,
    label: "Export",
    path: "/export",
    exactMatch: false,
    shortcut: "E",
  },
  {
    icon: <IconUserCog size={16} />,
    label: "My Account",
    path: "/account",
    exactMatch: false,
    shortcut: "U",
  },
];
