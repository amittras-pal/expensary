import { Box, Divider, ScrollArea, Text } from "@mantine/core";
import React from "react";
import ExpenseCard from "../../components/ExpenseCard";
import ExpenseListSkeleton from "../../components/ExpenseListSkeleton";
import { useMediaMatch } from "../../hooks/media-match";
import { useDashboardStyles } from "../../theme/dashboard.styles";

interface IRecentTransactionsProps {
  list: IExpense[];
  loadingList: boolean;
  onEditExpense: (e: IExpense) => void;
  onDeleteExpense: (e: IExpense) => void;
}

export default function RecentTransactions({
  list,
  loadingList,
  onEditExpense,
  onDeleteExpense,
}: IRecentTransactionsProps) {
  const isMobile = useMediaMatch();
  const { classes } = useDashboardStyles();

  if (loadingList) return <ExpenseListSkeleton />;

  return isMobile ? (
    <ItemList
      list={list}
      onEditExpense={onEditExpense}
      onDeleteExpense={onDeleteExpense}
    />
  ) : (
    <Box className={classes.listWrapper}>
      <Text fw="bold">Recent Transactions ({list?.length})</Text>
      <Divider my="xs" />
      <ScrollArea h="calc(100vh - 162px)">
        <ItemList
          list={list}
          onEditExpense={onEditExpense}
          onDeleteExpense={onDeleteExpense}
        />
      </ScrollArea>
    </Box>
  );
}

function ItemList({
  list,
  onEditExpense,
  onDeleteExpense,
}: Omit<IRecentTransactionsProps, "loadingList">): JSX.Element {
  return (
    <>
      {list?.length > 0
        ? list.map((exp) => (
            <ExpenseCard
              hideMenu={false}
              key={exp._id}
              data={exp}
              onEditExpense={onEditExpense}
              onDeleteExpense={onDeleteExpense}
            />
          ))
        : "No Expenses"}
    </>
  );
}
