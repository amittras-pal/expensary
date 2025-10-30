import { useState } from "react";
import { Group, Select, Switch, useMantineTheme } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { APP_TITLE } from "../../constants/app";
import ListView from "./components/ListView";
import TimelineView from "./components/TimelineView";

export default function Plans() {
  useDocumentTitle(`${APP_TITLE} | Vacations & Plans`);

  const { primaryColor } = useMantineTheme();

  const [showClosed, setShowClosed] = useState(
    () => sessionStorage.getItem("showClosedPlans") === "true"
  );
  const [viewMode, setViewMode] = useState<"list" | "timeline">(() => {
    const stored = sessionStorage.getItem("plans_viewMode");
    return stored === "timeline" ? "timeline" : "list";
  });

  const handleShowClosedToggle = (checked: boolean) => {
    console.log("Calledwith", checked);

    setShowClosed(checked);
    sessionStorage.setItem("showClosedPlans", checked ? "true" : "false");
  };

  return (
    <>
      <Group gap="sm" align="center" mb="sm">
        <Select
          mb={0}
          value={viewMode}
          onChange={(val) => {
            const next = (val as "list" | "timeline") || "list";
            setViewMode(next);
            sessionStorage.setItem("plans_viewMode", next);
          }}
          data={[
            { value: "list", label: "List" },
            { value: "timeline", label: "Timeline" },
          ]}
          w={160}
          size="xs"
        />
        <Switch
          size="sm"
          color={primaryColor}
          checked={showClosed}
          onChange={(e) => handleShowClosedToggle(e.currentTarget.checked)}
          label={showClosed ? "Showing All Plans": "Closed Plans Hidden"}
        />
      </Group>
      {viewMode === "list" && (
        <ListView
          showClosed={showClosed}
          onShowClosedClick={() => handleShowClosedToggle(true)}
        />
      )}
      {viewMode === "timeline" && (
        <TimelineView
          showClosed={showClosed}
          onShowClosedClick={() => handleShowClosedToggle(true)}
        />
      )}
    </>
  );
}
