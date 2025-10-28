import { Box, Divider, Text } from "@mantine/core";
import dayjs from "dayjs";

interface IPlanDetailsPanelProps {
  data: IExpensePlan;
}

export default function PlanDetailsPanel({
  data,
}: Readonly<IPlanDetailsPanelProps>) {
  return (
    <Box
      style={(theme) => ({
        display: "flex",
        flexDirection: "column",
        backgroundColor: theme.colors.dark[6],
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
        height: "100%",
      })}
    >
      <Text fz="lg" fw="bold">
        {data.name}
      </Text>
      <Text style={{ whiteSpace: "pre-wrap" }}>{data.description}</Text>
      <Divider my="lg" />
      <Text fz="sm">
        <Text component="span" c="dimmed">
          Status:{" "}
        </Text>
        <Text
          component="span"
          fw="bold"
          c={data.open ? "green" : "red"}
        >
          {data.open ? "Open" : "Closed"}
        </Text>
      </Text>
      <Text fz="sm">
        <Text component="span" c="dimmed">
          Created:{" "}
        </Text>
        <Text component="span" fw="bold">
          {dayjs(data.createdAt).format("DD MMM, 'YY hh:mm a")}
        </Text>
      </Text>
      {data.executionRange?.from && data.executionRange?.to && (
        <Text fz="sm">
          <Text component="span" c="dimmed">
            Execution Dates:{" "}
          </Text>
          <Text component="span" fw="bold">
            {dayjs(data.executionRange.from).format("DD MMM, 'YY")} - {dayjs(
              data.executionRange.to
            ).format("DD MMM, 'YY")}
          </Text>
        </Text>
      )}
      <Text fz="sm">
        <Text component="span" c="dimmed">
          Last Updated:{" "}
        </Text>
        <Text component="span" fw="bold">
          {dayjs(data.updatedAt).format("DD MMM, 'YY hh:mm a")}
        </Text>
      </Text>
      <Text fz="sm">
        <Text component="span" c="dimmed">
          Last Action:{" "}
        </Text>
        <Text component="span" fw="bold">
          {data.lastAction}
        </Text>
      </Text>
    </Box>
  );
}
