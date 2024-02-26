import { Skeleton } from "@mantine/core";

export default function ExpenseListSkeleton() {
  return (
    <>
      <Skeleton height={100} mb="sm" width="100%" radius="md" />
      <Skeleton height={100} mb="sm" width="100%" radius="md" />
      <Skeleton height={100} mb="sm" width="100%" radius="md" />
      <Skeleton height={100} mb="sm" width="100%" radius="md" />
    </>
  );
}
