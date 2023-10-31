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
