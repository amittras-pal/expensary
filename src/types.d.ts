interface TablerIconsProps
  extends Partial<Omit<React.SVGProps<SVGSVGElement>, "stroke">> {
  size?: string | number;
  stroke?: string | number;
}

declare module "*.svg?react" {
  const content: React.FunctionComponent<React.SVGAttributes<SVGElement>>;
  export default content;
}

declare module "*.ttf";

declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

interface RouteItem {
  icon: (props: TablerIconsProps) => JSX.Element;
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
  seenChangelog: boolean;
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
  remarks?: string;
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
  executionRange?: { from: Date | string | null; to: Date | string | null };
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

interface ISearchReqBody {
  q?: string;
  startDate?: Date;
  endDate?: Date;
  sort?: Record<string, 1 | -1>;
  categories?: string[];
}

interface IReleaseInfo {
  name: string;
  publishedAt: string;
  isLatest: boolean;
  isPrerelease: boolean;
  isDraft: boolean;
  tagName: string;
  description: string;
  author: {
    name: string;
    avatarUrl: string;
  };
}

interface IReleaseResponse {
  repository: {
    releases: {
      nodes: IReleaseInfo[];
    };
  };
}

interface IContributorInfo {
  user: {
    name: string;
    avatarUrl: string;
    bio: string;
    createdAt: string;
    company: string;
    location: string;
    socialAccounts: {
      nodes: {
        displayName: string;
        provider: string;
      }[];
    };
    url: string;
  };
}

type SelectOptionsGrouped = {
  group: string;
  items: {
    value: string;
    label: string;
    meta: string;
  }[];
}[];
