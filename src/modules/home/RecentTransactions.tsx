import { Box, Divider, ScrollArea, Text } from "@mantine/core";
import dayjs from "dayjs";
import ExpenseCard from "../../components/ExpenseCard";
import ExpenseListSkeleton from "../../components/ExpenseListSkeleton";
import { useCurrentUser } from "../../context/user.context";
import { useMediaMatch } from "../../hooks/media-match";
import { useDashboardStyles } from "../../theme/modules/dashboard.styles";

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
}: Readonly<IRecentTransactionsProps>) {
  const isMobile = useMediaMatch();
  const { classes } = useDashboardStyles();
  const { userData } = useCurrentUser();

  return isMobile ? (
    <ItemList
      list={list}
      loadingList={loadingList}
      onEditExpense={onEditExpense}
      onDeleteExpense={onDeleteExpense}
    />
  ) : (
    <Box className={classes.listWrapper}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Text fw="bold">
          {list?.length > 0 ? list.length : "No"} Recent Transactions
        </Text>
        <Text color="dimmed" fz="xs" fs="italic">
          Since{" "}
          {dayjs()
            .subtract(userData?.editWindow ?? 7, "days")
            .format("DD MMM")}{" "}
          ({userData?.editWindow ?? 7} days)
        </Text>
      </Box>
      <Divider my="xs" />
      <ScrollArea h="calc(100vh - 162px)">
        <ItemList
          list={list}
          loadingList={loadingList}
          onEditExpense={onEditExpense}
          onDeleteExpense={onDeleteExpense}
        />
      </ScrollArea>
    </Box>
  );
}

function ItemList({
  list,
  loadingList,
  onEditExpense,
  onDeleteExpense,
}: Readonly<IRecentTransactionsProps>) {
  if (loadingList) return <ExpenseListSkeleton />;

  return (
    <>
      {list?.length > 0 ? (
        list.map((exp) => (
          <ExpenseCard
            hideMenu={false}
            key={exp._id}
            data={exp}
            onEditExpense={onEditExpense}
            onDeleteExpense={onDeleteExpense}
          />
        ))
      ) : (
        <Text fs="italic" align="center" my="xl" fz="sm">
          No recent expenses to show.
        </Text>
      )}
    </>
  );
}
