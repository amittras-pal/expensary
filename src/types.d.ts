declare module "*.svg" {
  const content: string;
  export default content;
}

interface RouteItem {
  icon: JSX.Element;
  label: string;
  path: string;
  exactMatch: boolean;
  shortcut: string;
}

interface GuardProps {
  children: JSX.Element;
}

// ========================ENTITIES========================
interface IUser {
  _id?: string;
  userName: string;
  email: string;
  pin?: string;
  timeZone: string;
}

interface ICategory {
  _id?: string;
  label: string;
  group: string;
  color: string;
  icon: string;
  description?: string;
}

interface IBudget {
  _id?: string;
  user: string;
  month: number;
  year: number;
  amount: number;
}
