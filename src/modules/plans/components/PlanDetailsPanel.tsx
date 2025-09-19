import { Badge, Box, Divider, Text } from "@mantine/core";
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
      <Text fz="sm" display="flex" style={{ alignItems: "center" }}>
        <Text component="span" c="dimmed">
          Status:{" "}
        </Text>
        <Badge
          ml={6}
          variant="light"
          component="span"
          color={data.open ? "indigo" : "red"}
        >
          {data.open ? "Open" : "Closed"}
        </Badge>
      </Text>
      <Text fz="sm">
        <Text component="span" c="dimmed">
          Created:{" "}
        </Text>
        <Text component="span" fw="bold">
          {dayjs(data.createdAt).format("DD MMM, hh:mm a")}
        </Text>
      </Text>
      <Text fz="sm">
        <Text component="span" c="dimmed">
          Last Updated:{" "}
        </Text>
        <Text component="span" fw="bold">
          {dayjs(data.updatedAt).format("DD MMM, hh:mm a")}
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
