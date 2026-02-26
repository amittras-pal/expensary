import { useMemo, useState } from "react";
import {
  Divider,
  Group,
  SegmentedControl,
  useMantineTheme,
} from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import dayjs from "dayjs";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import ModuleLocked from "./components/ModuleLocked";
import RollingTrend from "./components/RollingTrend";
import YearTrend from "./components/YearTrend";

export default function StatsEngine() {
  const { userData } = useCurrentUser();
  const { primaryColor } = useMantineTheme();
  const [view, setView] = useState<"yearly" | "rolling">("rolling");
  const accountAge = useMemo(
    () => dayjs().diff(dayjs(userData?.createdAt), "month", true).valueOf(),
    [userData]
  );

  useDocumentTitle(`${APP_TITLE} | Spend Statistics`);

  if (accountAge < 3) return <ModuleLocked />;

  return (
    <>
      <Group gap="sm" component="div" id="control-space">
        <SegmentedControl
          color={primaryColor}
          value={view}
          size={"md"}
          onChange={(v) => setView(v as "yearly" | "rolling")}
          data={[
            { label: "Yearly", value: "yearly" },
            { label: "Recent", value: "rolling" },
          ]}
        />
        <Divider orientation="vertical" color="gray" mx={0} />
      </Group>
      <Divider my="sm" style={{ width: "100%" }} />
      {view === "yearly" ? <YearTrend /> : <RollingTrend />}
    </>
  );
}
