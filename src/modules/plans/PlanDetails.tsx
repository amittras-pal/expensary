// TODO: TS Migration

import { ActionIcon, LoadingOverlay, Modal, Tabs } from "@mantine/core";
import { useDisclosure, useDocumentTitle, useHotkeys } from "@mantine/hooks";
import { IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import DeleteExpense from "../../components/DeleteExpense";
import ExpenseForm from "../../components/ExpenseForm";
import { APP_TITLE, primaryColor } from "../../constants/app";
import { useErrorHandler } from "../../hooks/error-handler";
import { getPlanDetails } from "../../services/plans.service";
import PlanDetailsPanel from "./components/PlanDetailsPanel";
import PlanExpensesList from "./components/PlanExpensesList";
import PlanSummary from "./components/PlanSummary";

export default function PlanDetails() {
  const params = useParams();

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
      client.invalidateQueries(["list", payload]);
      client.invalidateQueries(["summary", params.id]);
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

  if (isLoading || !detailsRes) return <LoadingOverlay visible />;

  return (
    <>
      <Tabs
        defaultValue="summary"
        keepMounted={false}
        sx={{ height: "calc(100% - 62px)" }}
      >
        <Tabs.List>
          <Tabs.Tab value="summary">Summary</Tabs.Tab>
          <Tabs.Tab value="list">Expenses</Tabs.Tab>
          <Tabs.Tab
            value="info"
            ml="auto"
            icon={<IconInfoCircle size={16} />}
          />
        </Tabs.List>

        <Tabs.Panel value="summary" pt="xs" sx={{ height: "100%" }}>
          <PlanSummary />
        </Tabs.Panel>
        <Tabs.Panel value="list" pt="xs" sx={{ height: "100%" }}>
          <PlanExpensesList
            onExpenseAction={handleExpenseAction}
            plan={detailsRes?.response}
          />
        </Tabs.Panel>
        <Tabs.Panel value="info" pt="xs" sx={{ height: "100%" }}>
          <PlanDetailsPanel data={detailsRes?.response} />
        </Tabs.Panel>
      </Tabs>
      {detailsRes?.response?.open && (
        <ActionIcon
          size="xl"
          radius="xl"
          variant="filled"
          color={primaryColor}
          onClick={formModal.open}
          sx={{ position: "fixed", bottom: "1rem", right: "1rem" }}
        >
          <IconPlus size={24} />
        </ActionIcon>
      )}
      <Modal
        centered
        opened={showForm || confirm}
        withCloseButton={false}
        onClose={() => handleClose(false)}
        withOverlay
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
