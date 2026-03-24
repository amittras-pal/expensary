import { useMemo } from "react";
import dayjs from "dayjs";
import { useCurrentUser } from "../../context/user.context";
import ModuleLocked from "./components/ModuleLocked";
import RollingTrend from "./components/RollingTrend";

export default function StatsEngine() {
  const { userData } = useCurrentUser();
  const accountAge = useMemo(
    () => dayjs().diff(dayjs(userData?.createdAt), "month", true).valueOf(),
    [userData]
  );

  if (accountAge < 3) return <ModuleLocked />;

  return <RollingTrend />;
}
