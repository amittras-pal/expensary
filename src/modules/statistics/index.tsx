import { useDocumentTitle } from "@mantine/hooks";
import dayjs from "dayjs";
import { useMemo } from "react";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import ModuleLocked from "./components/ModuleLocked";
import YearTrend from "./components/YearTrend";

export default function StatsEngine() {
  const { userData } = useCurrentUser();
  const accountAge = useMemo(
    () => dayjs().diff(dayjs(userData?.createdAt), "month", true).valueOf(),
    [userData]
  );

  useDocumentTitle(`${APP_TITLE} | Spend Statistics`);

  return accountAge >= 3 ? <YearTrend /> : <ModuleLocked />;
}
