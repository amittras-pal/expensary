import { Stack, Text } from "@mantine/core";
import dayjs from "dayjs";
import { useCurrentUser } from "../../../context/user.context";
import EmptyState from "../../../resources/empty-state.svg?react";

export default function ModuleLocked() {
  const { userData } = useCurrentUser();
  return (
    <Stack
      justify="center"
      align="center"
      style={{ height: "100%", textAlign: "center" }}
    >
      <EmptyState height={275} />
      <Text fz="xl" fw="bold">
        Not Enough Data to Calculate Statistics.
      </Text>
      <Text fz="xs" fs="italic">
        Statistics Module will be available once you have used the app for 3
        months.
      </Text>
      <Text fz="xs" fs="italic">
        Will be available from{" "}
        {dayjs(userData?.createdAt).add(3, "months").format("DD MMM, YYYY")}.
      </Text>
    </Stack>
  );
}
