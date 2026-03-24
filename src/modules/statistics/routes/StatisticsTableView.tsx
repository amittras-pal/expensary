import { useOutletContext } from "react-router-dom";
import TrendTable from "../components/TrendTable";
import { RollingTrendOutletContext } from "../components/RollingTrend";

export default function StatisticsTableView() {
  const {
    tableMonthLabels,
    tableBudgets,
    tableSpends,
    tableCategoriesSeries,
    categoryColorMap,
    handleTableCellClick,
  } = useOutletContext<RollingTrendOutletContext>();

  return (
    <TrendTable
      monthLabels={tableMonthLabels}
      budgets={tableBudgets}
      spends={tableSpends}
      categoriesSeries={tableCategoriesSeries}
      categoryColorMap={categoryColorMap}
      onAmountCellClick={handleTableCellClick}
    />
  );
}
