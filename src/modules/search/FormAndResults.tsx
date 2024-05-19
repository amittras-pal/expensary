import { yupResolver } from "@hookform/resolvers/yup";
import {
  Accordion,
  Box,
  Button,
  Divider,
  Group,
  Loader,
  MultiSelect,
  SimpleGrid,
  Text,
  TextInput,
} from "@mantine/core";
import { DatePickerInput, PickerBaseProps } from "@mantine/dates";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import CategoryMultiSelectValue from "../../components/CategoryMultiSelectValue";
import CategorySelectItem from "../../components/CategorySelectItem";
import ExpenseCard from "../../components/ExpenseCard";
import { time20Min } from "../../constants/app";
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

export default function FormAndResults() {
  const [panel, setPanel] = useState<string | null>("filtersPanel");
  const [filters, setFilters] = useState<ISearchReqBody>({});

  const { onError } = useErrorHandler();
  const { userData } = useCurrentUser();
  const isMobile = useMediaMatch();

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

  const appliedFilter = useMemo(() => {
    let count = 0;
    if (filters.q) count++;
    if (filters.categories?.length) count++;
    if (filters.startDate || filters.endDate) count++;
    return count;
  }, [filters]);

  const handleSearch: SubmitHandler<GlobalSearchForm> = (values) => {
    setPanel(null);
    const payload: ISearchReqBody = {};
    if (values.q) payload.q = values.q;
    if (values.categories?.length) payload.categories = values.categories;
    if (values.dateRange.every((v) => v !== null)) {
      payload.startDate = values.dateRange[0] ?? undefined;
      payload.endDate = values.dateRange[1] ?? undefined;
    }
    setFilters(payload);
  };

  const { data: categoryRes, isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    onError,
    staleTime: time20Min,
  });

  const { data: expenses, isFetching } = useQuery({
    queryKey: ["search-results", filters],
    queryFn: () => searchExpenses(filters),
    enabled: appliedFilter > 0,
    onError,
  });

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

  const handleClear = () => {
    setFilters({});
    reset();
  };

  return (
    <>
      <Accordion
        classNames={{
          content: "filters-content",
          item: "filters-item",
          label: "filters-label",
        }}
        value={panel}
        onChange={setPanel}
      >
        <Accordion.Item value="filtersPanel">
          <Accordion.Control p={0} mb="xs">
            <Text pl="sm">Filters</Text>
          </Accordion.Control>
          <Accordion.Panel>
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
                size="xs"
              />
              <MultiSelect
                searchable
                clearable
                withinPortal
                size="xs"
                label="Categories"
                disabled={loadingCategories}
                value={watch("categories")}
                disableSelectedItemFiltering
                onChange={(e) =>
                  setValue("categories", e, { shouldDirty: true })
                }
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
              <DatePickerInput
                {...pickerProps}
                mb="md"
                clearable
                // dropdownType="modal"
                popoverProps={{ withinPortal: true }}
                label="Date Range"
                defaultDate={watch("dateRange")[0] ?? new Date()}
                placeholder="Search in a range of dates"
                onChange={(e) =>
                  setValue("dateRange", e, { shouldDirty: true })
                }
                value={[watch("dateRange")[0]!, watch("dateRange")[1]!]}
                size="xs"
              />
              <Group grow>
                <Button type="reset" variant="outline">
                  Clear All
                </Button>
                <Button type="submit" disabled={!isDirty || !isValid}>
                  Search
                </Button>
              </Group>
            </Box>
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
      <Box mt="md">
        {isFetching && (
          <Group position="center">
            <Loader />
          </Group>
        )}

        {(expenses?.response.length ?? 0) > 0 && (
          <>
            <Text fz="xs" color="dimmed" fs="italic">
              {expenses?.response.length} Expenses Found
            </Text>
            <Divider my="xs" />
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
          </>
        )}
      </Box>
    </>
  );
}
