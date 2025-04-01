import { Group, Loader, Select } from "@mantine/core";
import dayjs from "dayjs";
import { Dispatch, SetStateAction, useMemo, useState } from "react";
import { useCurrentUser } from "../../../context/user.context";
import { ChartData } from "../types";
import BudgetToCategoryGraph from "./BudgetToCategoryGraph";
import BudgetToTotalGraph from "./BudgetToTotalGraph";

type YearTrendProps = {
  data: ChartData[] | null;
  onSelect: (e: number) => void;
  year: string;
  isLoading: boolean;
  disableChange: boolean;
  setYear: Dispatch<SetStateAction<string>>;
};

type ViewTypes = "total" | "category";

export default function YearTrend(props: Readonly<YearTrendProps>) {
  const { userData } = useCurrentUser();
  const [viewType, setViewType] = useState<ViewTypes>("total");

  const yearOptions = useMemo(() => {
    const start = dayjs(userData?.createdAt).year();
    const end = dayjs().year();

    return [...Array(end - start + 1).keys()].map((v) =>
      (v + start).toString()
    );
  }, []);

  if (props.isLoading)
    return (
      <Group position="center" align="center" sx={{ height: "100%" }}>
        <Loader size={50} />
      </Group>
    );

  return (
    <>
      <Group position="apart" mb="sm" align="center" spacing={0}>
        <Select
          sx={{ flexGrow: 0, flexShrink: 1, flexBasis: "90px" }}
          value={props.year}
          onChange={(e) => props.setYear(e ?? "")}
          data={yearOptions}
          mb={0}
          autoFocus
          disabled={props.disableChange}
        />
        <Select
          sx={{ flexGrow: 0, flexShrink: 1, flexBasis: "160px" }}
          mb={0}
          value={viewType}
          onChange={(e: ViewTypes) => setViewType(e)}
          data={[
            { label: "View: Total", value: "total" },
            { label: "View: Categories", value: "category" },
          ]}
        />
      </Group>
      {viewType === "category" && (
        <BudgetToCategoryGraph data={props.data ?? []} />
      )}
      {viewType === "total" && <BudgetToTotalGraph data={props.data ?? []} />}
    </>
  );
}
