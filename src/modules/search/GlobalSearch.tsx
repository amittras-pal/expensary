import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Divider,
  Group,
  Modal,
  MultiSelect,
  ScrollArea,
  SimpleGrid,
  Text,
  TextInput,
  ThemeIcon,
  useMantineTheme,
} from "@mantine/core";
import { DatePicker, PickerBaseProps } from "@mantine/dates";
import { useDisclosure, useDocumentTitle } from "@mantine/hooks";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import React, { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CategoryMultiSelectValue from "../../components/CategoryMultiSelectValue";
import CategorySelectItem from "../../components/CategorySelectItem";
import ExpenseCard from "../../components/ExpenseCard";
import { APP_TITLE, time20Min } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import { useErrorHandler } from "../../hooks/error-handler";
import { useMediaMatch } from "../../hooks/media-match";
import { GlobalSearchForm, gSearchSchema } from "../../schemas/schemas";
import { getCategories } from "../../services/categories.service";
import { searchExpenses } from "../../services/expense.service";

interface CommonPickerProps extends PickerBaseProps<"range"> {
  minDate: Date;
  maxDate: Date;
}

export default function GlobalSearch() {
  useDocumentTitle(`${APP_TITLE} | Search Expenses`);
  const isMobile = useMediaMatch();
  const { primaryColor } = useMantineTheme();
  const { onError } = useErrorHandler();

  const { userData } = useCurrentUser();

  const [filters, setFilters] = useState<ISearchReqBody>({});
  const appliedFilter = useMemo(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.categories?.length) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  }, [filters]);

  const pickerProps = useMemo(
    (): CommonPickerProps => ({
      type: "range",
      maxDate: dayjs().toDate(),
      minDate: userData
        ? dayjs(userData?.createdAt).toDate()
        : dayjs().toDate(),
    }),
    [userData]
  );

  const {
    watch,
    setValue,
    handleSubmit,
    register,
    reset,
    formState: { isDirty, isValid },
  } = useForm<GlobalSearchForm>({
    defaultValues: {
      q: "",
      dateRange: [null, null],
      categories: [],
    },
    resolver: yupResolver(gSearchSchema),
  });

  const { data: categoryRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: time20Min,
  });

  const { data: expenses, isLoading } = useQuery({
    queryKey: ["search-results", filters],
    queryFn: () => searchExpenses(filters),
    enabled: appliedFilter > 0,
    onError,
  });

  const [modalOpen, filterModal] = useDisclosure(false);
  const handleSearch: SubmitHandler<GlobalSearchForm> = (values) => {
    filterModal.close();
    const payload: ISearchReqBody = {};
    if (values.q) payload.q = values.q;
    if (values.categories?.length) payload.categories = values.categories;
    if (values.dateRange.every((v) => v !== null)) {
      payload.startDate = values.dateRange[0] ?? undefined;
      payload.endDate = values.dateRange[1] ?? undefined;
    }
    setFilters(payload);
  };

  const handleClear = () => {
    setFilters({});
    reset();
    filterModal.close();
  };

  return (
    <>
      <Group position="apart">
        <Group>
          <IconSearch size={18} />
          <Text fw="bold">Search Expenses</Text>
        </Group>
        <Button
          size="xs"
          color={primaryColor}
          onClick={filterModal.open}
          variant={appliedFilter > 0 ? "filled" : "ghost"}
          leftIcon={<IconFilter size={18} />}
          loading={appliedFilter > 0 && isLoading}
        >
          Filters {appliedFilter > 0 ? `(${appliedFilter})` : ""}
        </Button>
      </Group>
      <Modal
        opened={modalOpen}
        onClose={filterModal.close}
        title="Apply Filters"
      >
        <Box
          component="form"
          onSubmit={handleSubmit(handleSearch)}
          onReset={handleClear}
        >
          <TextInput
            label="Expense Title / Description"
            placeholder="Enter text to search"
            {...register("q")}
            autoFocus
          />
          <MultiSelect
            searchable
            clearable
            label="Categories"
            disabled={loadingCategories}
            value={watch("categories")}
            disableSelectedItemFiltering
            onChange={(e) => setValue("categories", e, { shouldDirty: true })}
            itemComponent={CategorySelectItem}
            valueComponent={CategoryMultiSelectValue}
            placeholder={
              loadingCategories ? "Loading Categories" : "Select Categories"
            }
            data={
              categoryRes?.response?.map((cat) => ({
                ...cat,
                value: cat._id ?? "",
              })) ?? []
            }
          />
          <Text fz="sm" fw={500}>
            Date Range
          </Text>
          <Group position="center" my="md">
            <DatePicker
              {...pickerProps}
              defaultDate={watch("dateRange")[0] ?? new Date()}
              onChange={(e) => setValue("dateRange", e, { shouldDirty: true })}
              value={[watch("dateRange")[0]!, watch("dateRange")[1]!]}
            />
          </Group>
          <Group position="center">
            <Button type="reset" variant="outline">
              Clear All
            </Button>
            <Button type="submit" disabled={!isDirty || !isValid}>
              Search
            </Button>
          </Group>
        </Box>
      </Modal>
      {appliedFilter > 0 && (
        <>
          <Text fz="xs" color="dimmed" fs="italic">
            {expenses?.response.length} Expenses Found
          </Text>
          {(expenses?.response.length ?? 0) > 0 && (
            <>
              <Divider my="xs" />
              <ScrollArea h="calc(100vh - 162px)" sx={{ paddingBottom: "1px" }}>
                <SimpleGrid cols={isMobile ? 1 : 2} spacing="xs">
                  {expenses?.response.map((ex) => (
                    <ExpenseCard
                      hideMenu
                      key={ex._id}
                      data={ex}
                      hideMonthIndicator
                      highlight={filters.q ?? ""}
                    />
                  ))}
                </SimpleGrid>
              </ScrollArea>
            </>
          )}
        </>
      )}
      {appliedFilter === 0 && (
        <Box
          sx={(theme) => ({
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "calc(100vh - 162px)",
            gap: theme.spacing.sm,
          })}
        >
          <ThemeIcon
            color={primaryColor}
            variant="light"
            radius="xl"
            size={120}
          >
            <IconSearch size={100} stroke={1} />
          </ThemeIcon>
          <Text color="dimmed">
            Use the filters to search all your expenses.
          </Text>
        </Box>
      )}
    </>
  );
}
