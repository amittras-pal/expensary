declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.ttf";

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

/** ========================ENTITIES========================  */
interface IUser {
  _id?: string;
  userName: string;
  email: string;
  pin?: string;
  timeZone: string;
  createdAt: string;
  updatedAt: string;
  editWindow: number;
  color: string;
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

interface IExpense {
  _id?: string;
  title: string;
  description: string;
  date: Date | string;
  categoryId: string;
  category?: ICategory;
  user: string;
  plan?: string | null;
  amount: number;
  reverted: boolean;
  linked: string | null;
}

interface IExpensePlan {
  _id: string;
  name: string;
  description: string;
  user: string;
  open: boolean;
  createdAt: string;
  updatedAt: string;
  lastAction:
    | "Created"
    | "Updated"
    | "Expense Added"
    | "Expense Updated"
    | "Expense Removed"
    | "Closed";
}

interface SummaryCategory extends ICategory {
  value: number;
}

interface SummaryItem {
  subCategories: SummaryCategory[];
  total: number;
}
