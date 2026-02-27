import { useEffect } from "react";
import {
  AppShell,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Image,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
  rem,
} from "@mantine/core";
import {
  IconArrowRight,
  IconBrandGithub,
  IconCalendarEvent,
  IconCalendarRepeat,
  IconChartBar,
  IconChartPie,
  IconCheck,
  IconFileSpreadsheet,
  IconKeyboard,
  IconListDetails,
  IconPalette,
  IconSearch,
} from "@tabler/icons-react";
import { useNavigate } from "react-router-dom";
import { APP_TITLE } from "../../constants/app";
import logoPath from "../../resources/app-logo.svg";
import { isLoggedIn } from "../../utils";

export default function LandingPage() {
  const navigate = useNavigate();
  const authenticated = isLoggedIn();

  useEffect(() => {
    if (authenticated) {
      const timer = setTimeout(() => {
        navigate("/home");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [authenticated, navigate]);

  const handleAction = () => {
    if (authenticated) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  return (
    <AppShell header={{ height: 60 }} padding="md">
      <AppShell.Header>
        <Container size="lg" h="100%">
          <Group justify="space-between" h="100%">
            <Group gap="xs">
              <Image src={logoPath} w={30} h={30} />
              <Title order={4}>{APP_TITLE}</Title>
            </Group>
            <Group>
              <Button
                variant="light"
                onClick={handleAction}
                rightSection={!authenticated && <IconArrowRight size={16} />}
                loading={Boolean(authenticated)}
              >
                {authenticated ? "Redirecting..." : "Login"}
              </Button>
            </Group>
          </Group>
        </Container>
      </AppShell.Header>

      <AppShell.Main>
        <Container size="lg" py="xl" px={0}>
          {/* Hero Section */}
          <Stack gap="xl" py={50} align="center">
            <Title
              order={1}
              size={50}
              style={{ textAlign: "center", lineHeight: 1.1 }}
            >
              Track your daily spending with <br />
              <Text span c="blue" inherit>
                clarity and control
              </Text>
            </Title>
            <Text c="dimmed" size="lg" maw={600} ta="center">
              No spreadsheets, no clutter, just what matters. Built on a
              budget-first approach, Expensary makes adding expenses quick and
              reviewing them even quicker.
            </Text>
            <Group>
              <Button
                size="lg"
                onClick={handleAction}
                rightSection={!authenticated && <IconArrowRight size={20} />}
                loading={Boolean(authenticated)}
              >
                {authenticated ? "Redirecting..." : "Get Started"}
              </Button>
            </Group>

            {/* Placeholder for Hero Image */}
            <Card
              withBorder
              padding="xl"
              radius="md"
              w="100%"
              h={400}
              bg="var(--mantine-color-gray-1)"
            >
              <Stack align="center" justify="center" h="100%">
                <Text c="dimmed">Application Screenshot Placeholder</Text>
              </Stack>
            </Card>
          </Stack>

          {/* Features Section */}
          <Title order={2} ta="center" mt={50} mb="xl">
            Key Features
          </Title>
          <SimpleGrid
            cols={{ base: 1, sm: 2, md: 3 }}
            spacing={20}
            verticalSpacing={20}
          >
            {features.map((feature) => (
              <Card
                key={feature.title}
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
              >
                <ThemeIcon
                  size="xl"
                  radius="md"
                  variant="light"
                  color={feature.color}
                  mb="md"
                >
                  <feature.icon
                    style={{ width: rem(28), height: rem(28) }}
                    stroke={1.5}
                  />
                </ThemeIcon>
                <Text fw={700} size="lg" mb="xs" mt={5}>
                  {feature.title}
                </Text>
                <Text c="dimmed" size="sm">
                  {feature.description}
                </Text>
              </Card>
            ))}
          </SimpleGrid>

          {/* Tech Specs Section */}
          <Container size="md" mt={80} mb={50}>
            <Stack align="center" gap="lg">
              <Title order={2}>Tech Specs</Title>
              <Text c="dimmed" ta="center">
                Built as a real-world case study using the MERN stack. Source
                code is open for both frontend and backend.
              </Text>
              <Group>
                <Button
                  component="a"
                  href="https://github.com/amittras-pal/expensary"
                  target="_blank"
                  leftSection={<IconBrandGithub size={20} />}
                  variant="outline"
                >
                  Frontend Repo
                </Button>
                <Button
                  component="a"
                  href="https://github.com/amittras-pal/money-trace"
                  target="_blank"
                  leftSection={<IconBrandGithub size={20} />}
                  variant="outline"
                >
                  Backend Repo
                </Button>
              </Group>
            </Stack>
          </Container>

          <Divider my="xl" />
          <Text ta="center" size="sm" c="dimmed" pb="xl">
            Designed with{" "}
            <Text span c="red">
              ❤️
            </Text>{" "}
            by{" "}
            <Text
              component="a"
              href="https://www.linkedin.com/in/amittras-pal"
              target="_blank"
              c="blue"
              style={{ textDecoration: "none" }}
            >
              Amittras Pal
            </Text>
          </Text>
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}

const features = [
  {
    title: "41 Pre-Built Categories",
    description:
      "Choose from 41 ready-to-use categories organized into 7 parent groups. Your dashboard shows exactly where your money goes—at a glance.",
    icon: IconListDetails,
    color: "blue",
  },
  {
    title: "Dashboard Summary",
    description:
      "See your current month's spending broken down by category with visual progress bars and percentage shares.",
    icon: IconChartPie,
    color: "cyan",
  },
  {
    title: "Recent Transactions",
    description:
      "Quickly access your most recent expenses right from the dashboard. Set your preferred editing window (5-25 days).",
    icon: IconCheck,
    color: "teal",
  },
  {
    title: "Global Search",
    description:
      "Find any expense in seconds. Search by title, description, category, or date range.",
    icon: IconSearch,
    color: "grape",
  },
  {
    title: "Plans & Events",
    description:
      "Track trips, events, and special projects separately from your regular budget. View plans as a list or timeline.",
    icon: IconCalendarEvent,
    color: "orange",
  },
  {
    title: "Recurring Expenses",
    description:
      "Set up rules for expenses that repeat every month—rent, subscriptions, EMIs—and have them created automatically on the day you choose.",
    icon: IconCalendarRepeat,
    color: "indigo",
  },
  {
    title: "Spending Statistics",
    description:
      "Visualize rolling recent months of spending against your budget. Drill into any month's category breakdown with interactive charts.",
    icon: IconChartBar,
    color: "green",
  },
  {
    title: "Export to Excel",
    description:
      "Download detailed expense reports as Excel files. Export by custom date range, month range, or for specific plans.",
    icon: IconFileSpreadsheet,
    color: "lime",
  },
  {
    title: "Personalization",
    description:
      "Choose your theme color, adjust your editing window, update your display name, and manage your password—all in one place.",
    icon: IconPalette,
    color: "pink",
  },
  {
    title: "Keyboard Shortcuts",
    description:
      "Navigate faster using keyboard shortcuts for adding expenses, clearing filters, and more.",
    icon: IconKeyboard,
    color: "violet",
  },
];
