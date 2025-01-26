import {
  Box,
  Divider,
  ScrollArea,
  SimpleGrid,
  Text,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { IconListCheck } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useParams } from "react-router-dom";
import BudgetItem from "../../../components/BudgetItem";
import ContainedLoader from "../../../components/loaders/ContainedLoader";
import { useErrorHandler } from "../../../hooks/error-handler";
import { getSummary } from "../../../services/expense.service";
import { formatCurrency } from "../../../utils";

function PlanSummary() {
  const { onError } = useErrorHandler();
  const { primaryColor } = useMantineTheme();
  const params = useParams();

  const { data: summary, isLoading: loadingSummary } = useQuery({
    queryKey: ["plan-summary", params.id],
    queryFn: () => getSummary(params.id ?? ""),
    staleTime: 5 * 60 * 1000,
    onError,
  });

  const summaryData = useMemo(() => {
    return summary ? Object.entries(summary?.response.summary ?? {}) : [];
  }, [summary]);

  if (loadingSummary)
    return (
      <Box
        sx={{
          height: "100%",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ContainedLoader size={150} />
      </Box>
    );

  return (
    <Box
      sx={(theme) => ({
        height: "100%",
        backgroundColor: theme.colors.dark[6],
        padding: theme.spacing.sm,
        borderRadius: theme.radius.md,
      })}
    >
      <ScrollArea w="100%" h="calc(100% - 50px)">
        <SimpleGrid
          cols={summaryData.length > 0 ? 2 : 1}
          spacing="xs"
          verticalSpacing="xs"
          breakpoints={[
            { maxWidth: "md", cols: 2, spacing: "sm", verticalSpacing: "sm" },
            { maxWidth: "sm", cols: 1, spacing: "sm", verticalSpacing: "sm" },
          ]}
        >
          {summaryData.length === 0 && (
            <Box
              sx={{
                height: "200px",
                width: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ThemeIcon size={100} color={primaryColor} radius="xl">
                <IconListCheck size={75} />
              </ThemeIcon>
              <Text fz="lg" color="dimmed" mt="md">
                No Expenses Added
              </Text>
            </Box>
          )}
          {summaryData?.map((data) => (
            <BudgetItem
              data={data}
              key={data[0]}
              overallSpent={summary?.response.total ?? 0}
            />
          ))}
        </SimpleGrid>
      </ScrollArea>
      <Divider my={8} />
      <Text fw="bold" fz="lg" px={4}>
        Total: {formatCurrency(summary?.response?.total)}
      </Text>
    </Box>
  );
}

export default PlanSummary;
