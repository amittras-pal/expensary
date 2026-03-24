import { useOutletContext } from "react-router-dom";
import BudgetVsSpentChart from "../components/BudgetVsSpentChart";
import { RollingTrendOutletContext } from "../components/RollingTrend";

export default function StatisticsChartView() {
  const {
    xAxisLabels,
    budgets,
    spends,
    yearChangeMarkers,
    loadingStats,
    showCategoryStack,
    categoriesSeries,
    categoryColorMap,
    handleChartClick,
  } = useOutletContext<RollingTrendOutletContext>();

  return (
    <BudgetVsSpentChart
      xAxisLabels={xAxisLabels}
      budgets={budgets}
      spends={spends}
      yearChangeMarkers={yearChangeMarkers}
      loading={loadingStats}
      showCategoryStack={showCategoryStack}
      categoriesSeries={categoriesSeries}
      categoryColorMap={categoryColorMap}
      onPointClick={handleChartClick}
    />
  );
}
