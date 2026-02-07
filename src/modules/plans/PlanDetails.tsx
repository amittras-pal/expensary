import { useMemo, useState } from "react";
import {
  ActionIcon,
  Modal,
  Tabs,
  Tooltip,
  useMantineTheme,
} from "@mantine/core";
import { useDisclosure, useDocumentTitle, useHotkeys } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconArrowLeft,
  IconDownload,
  IconPlus,
  IconTableDown,
} from "@tabler/icons-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import DeleteExpense from "../../components/DeleteExpense";
import ExpenseForm from "../../components/ExpenseForm";
import OverlayLoader from "../../components/loaders/OverlayLoader";
import { APP_TITLE } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { exportPlan } from "../../services/export.service";
import { getPlanDetails } from "../../services/plans.service";
import { downloadFile } from "../../utils";
import PlanDetailsPanel from "./views/PlanDetailsPanel";
import PlanExpensesList from "./views/PlanExpensesList";
import PlanSummary from "./views/PlanSummary";

export default function PlanDetails() {
  const params = useParams();
  const navigate = useNavigate();
  const { primaryColor, colors } = useMantineTheme();

  const [showForm, formModal] = useDisclosure(false);
  const [confirm, deleteModal] = useDisclosure(false);

  const [targetExpense, setTargetExpense] = useState<IExpense | null>(null);
  const client = useQueryClient();
  const { onError } = useErrorHandler();
  const payload = useMemo(
    () => ({
      sort: { date: -1 },
      plan: params.id,
    }),
    [params]
  );

  const { data: detailsRes, isLoading } = useQuery({
    queryKey: ["plan-details", params.id],
    queryFn: () => getPlanDetails(params.id ?? ""),
    onError,
  });

  useDocumentTitle(
    `${APP_TITLE} | Plan: ${detailsRes?.response?.name ?? "Loading..."}`
  );

  const handleClose = (refreshData: IExpense | boolean) => {
    if (showForm) formModal.close();
    if (confirm) deleteModal.close();

    if (refreshData) {
      // clear the listing data cache
      client.invalidateQueries(["plans-list", true]);
      client.invalidateQueries(["plans-list", false]);
      // clear expenses list cache
      client.invalidateQueries(["list", payload]);
      // clear expense summary cache
      client.invalidateQueries(["plan-summary", params.id]);
      // clear details view cache
      client.invalidateQueries(["plan-details", params.id]);
    }

    setTimeout(() => {
      setTargetExpense(null);
    }, 500);
  };

  const handleExpenseAction = (data: IExpense, mode: "edit" | "delete") => {
    setTargetExpense(data);
    switch (mode) {
      case "edit":
        formModal.open();
        break;
      case "delete":
        deleteModal.open();
        break;
      default:
        break;
    }
  };

  useHotkeys([["N", formModal.open]]);

  const { mutate: downloadPlan, isLoading: downloadingPlan } = useMutation({
    mutationFn: exportPlan,
    onSuccess: (res) => {
      downloadFile(res, `Plan Export - ${params.id}.xlsx`);
      notifications.show({
        message: "",
        title: "Plan Details Exported Successfully!",
        color: "green",
        icon: <IconDownload size={16} />,
      });
    },
    onError,
  });

  if (isLoading || !detailsRes) return <OverlayLoader visible />;

  return (
    <>
      <Tabs defaultValue="summary" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab
            value="back"
            onClick={(e) => {
              e.preventDefault();
              navigate(-1);
            }}
            color={primaryColor}
            leftSection={
              <IconArrowLeft
                style={{ color: colors[primaryColor][4] }}
                size={16}
              />
            }
          />
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
          <Tabs.Tab value="list">Expenses</Tabs.Tab>
          <Tabs.Tab value="info">Info</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="summary" pt="xs" style={{ height: "100%" }}>
          <PlanSummary />
        </Tabs.Panel>
        <Tabs.Panel value="list" pt="xs" style={{ height: "100%" }}>
          <PlanExpensesList
            onExpenseAction={handleExpenseAction}
            plan={detailsRes?.response}
          />
        </Tabs.Panel>
        <Tabs.Panel value="info" pt="xs" style={{ height: "100%" }}>
          <PlanDetailsPanel data={detailsRes?.response} />
        </Tabs.Panel>
      </Tabs>
      {detailsRes?.response?.open && (
        <Tooltip label="Add New Expense" position="left" color="dark">
          <ActionIcon
            size="xl"
            radius="xl"
            variant="filled"
            color={primaryColor}
            onClick={formModal.open}
            style={{ position: "fixed", bottom: "4.5rem", right: "1rem" }}
          >
            <IconPlus size={20} />
          </ActionIcon>
        </Tooltip>
      )}
      <Tooltip label="Export this plan" position="left" color="dark">
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={"green"}
          onClick={() => downloadPlan({ plan: params.id ?? "" })}
          loading={downloadingPlan}
          style={{ position: "fixed", bottom: "1rem", right: "1rem" }}
        >
          <IconTableDown size={20} />
        </ActionIcon>
      </Tooltip>
      <Modal
        opened={showForm || confirm}
        withCloseButton={false}
        onClose={() => handleClose(false)}
        zIndex={1000}
      >
        {showForm && (
          <ExpenseForm data={targetExpense} onComplete={handleClose} />
        )}
        {confirm && (
          <DeleteExpense data={targetExpense} onComplete={handleClose} />
        )}
      </Modal>
    </>
  );
}
