import {
  Avatar,
  Box,
  Code,
  Divider,
  Group,
  HoverCard,
  List,
  Loader,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconBuilding, IconMapPin } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Fragment, PropsWithChildren, useMemo, useState } from "react";
import { Components, ExtraProps } from "react-markdown";
import { getContributor } from "../../services/app-info.service";

// Render a code block
const CodeBlock = (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
  return <Code>{props.children}</Code>;
};

// Render 'hX' tags,
// all headings are rendered as h2 for now.
const Heading = (props: JSX.IntrinsicElements["h2"] & ExtraProps) => {
  return (
    <Text component="h2">
      <AddLinksInGFM>{props.children}</AddLinksInGFM>
    </Text>
  );
};

// Render 'ul' tags
const UnorderedList = (props: JSX.IntrinsicElements["ul"] & ExtraProps) => {
  return <List type="unordered">{props.children}</List>;
};

// Render 'li' tags
const ListItem = (props: JSX.IntrinsicElements["li"] & ExtraProps) => {
  return (
    <List.Item fz="sm">
      {props.children?.valueOf() !== props.children?.toString() ? (
        props.children
      ) : (
        <AddLinksInGFM>{props.children}</AddLinksInGFM>
      )}
    </List.Item>
  );
};

// Render 'p' tags
const Paragraph = (props: JSX.IntrinsicElements["p"] & ExtraProps) => {
  return (
    <Text component="p">
      {Array.isArray(props.children)
        ? props.children.map((segment, index) =>
            typeof segment === "string" ? (
              <AddLinksInGFM key={index}>{segment}</AddLinksInGFM>
            ) : (
              <Fragment key={index}>{segment}</Fragment>
            )
          )
        : props.children}
    </Text>
  );
};

// Render a custom hover card for the contributor details.
const UserCard = (props: Readonly<{ username: string }>) => {
  const [open, setOpen] = useState(false);
  const { isLoading, data } = useQuery({
    queryKey: ["contributor", props.username],
    queryFn: () => getContributor({ username: props.username.slice(1) }),
    staleTime: 10 * 60 * 1000,
    enabled: open,
  });

  const user = useMemo(() => {
    return data?.response?.user ?? null;
  }, [data, isLoading]);

  return (
    <HoverCard
      width={300}
      position="bottom"
      shadow="md"
      withinPortal
      withArrow
      initiallyOpened={false}
      onOpen={() => setOpen(true)}
      onClose={() => setOpen(false)}
    >
      <HoverCard.Target>
        <Text component="span" sx={{ cursor: "pointer" }} color="yellow">
          {props.username + " "}
        </Text>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        {isLoading ? (
          <Loader size="xl" />
        ) : (
          <>
            <Group position="left" align="center">
              <Avatar src={user?.avatarUrl ?? ""} size="lg" radius="xl" />
              <Box>
                <Text
                  fz="lg"
                  component="a"
                  href={user?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {user?.name}
                </Text>
                <Text fz="xs" color="dimmed">
                  {user?.bio}
                </Text>
              </Box>
            </Group>
            <Divider my="xs" />
            {user?.location && (
              <Group align="center" spacing="xs">
                <ThemeIcon size="sm" variant="light" radius="xl" color="gray">
                  <IconMapPin />
                </ThemeIcon>
                <Text component="span" fz="sm">
                  {user.location}
                </Text>
              </Group>
            )}
            {user?.company && (
              <Group align="center" spacing="xs" mt="xs">
                <ThemeIcon size="sm" variant="light" radius="xl" color="gray">
                  <IconBuilding />
                </ThemeIcon>
                <Text component="span" fz="sm">
                  {user.company}
                </Text>
              </Group>
            )}
          </>
        )}
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

// Render custom link tag for pull request numbers.
const PRLink = (props: Readonly<{ link: string }>) => {
  return (
    <Text
      component="a"
      href={props.link}
      target="_blank"
      rel="noopener noreferrer"
      color="cyan"
    >
      {`PR#${props.link.split("/").at(-1)} `}
    </Text>
  );
};

// Replace links of PR and username with custom links.
const AddLinksInGFM = (props: Readonly<PropsWithChildren>) => {
  return (
    <>
      {props.children
        ?.toString()
        .split(" ")
        .map((word, index) => {
          if (word.startsWith("@"))
            return <UserCard key={index} username={word} />;
          if (word.startsWith("https://"))
            return <PRLink key={index} link={word} />;
          return <Fragment key={index}>{`${word} `}</Fragment>;
        })}
    </>
  );
};

// Markdown component set.
export const components: Components = {
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  ul: UnorderedList,
  li: ListItem,
  p: Paragraph,
  code: CodeBlock,
};
