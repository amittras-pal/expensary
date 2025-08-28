import {
  Avatar,
  Blockquote,
  Box,
  Code,
  Divider,
  Group,
  HoverCard,
  Image,
  List,
  Text,
  ThemeIcon,
} from "@mantine/core";
import { IconBuilding, IconMapPin } from "@tabler/icons-react";
import { useQuery } from "@tanstack/react-query";
import { Fragment, PropsWithChildren, useMemo, useState } from "react";
import { Components, ExtraProps } from "react-markdown";
import { getContributor } from "../../services/app-info.service";
import ContainedLoader from "../loaders/ContainedLoader";

// Render a code block
const CodeBlock = (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
  return <Code>{props.children}</Code>;
};

// Render 'hX' tags,
const Heading1 = (props: JSX.IntrinsicElements["h1"] & ExtraProps) => {
  return (
    <Text component="h1" fz="2.5rem" fw="normal">
      <AddLinksInGFM>{props.children}</AddLinksInGFM>
    </Text>
  );
};
const Heading2 = (props: JSX.IntrinsicElements["h2"] & ExtraProps) => {
  return (
    <Text component="h2" fz="2rem" fw="normal">
      <AddLinksInGFM>{props.children}</AddLinksInGFM>
    </Text>
  );
};
const Heading3 = (props: JSX.IntrinsicElements["h3"] & ExtraProps) => {
  return (
    <Text component="h3" fz="1.75rem" fw="normal">
      <AddLinksInGFM>{props.children}</AddLinksInGFM>
    </Text>
  );
};
const Heading4 = (props: JSX.IntrinsicElements["h4"] & ExtraProps) => {
  return (
    <Text component="h4" fz="1.5rem" fw="normal">
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
        ? props.children.map((segment, i) =>
            typeof segment === "string" ? (
              <AddLinksInGFM key={segment + i}>{segment}</AddLinksInGFM>
            ) : (
              <Fragment key={segment + i}>{segment}</Fragment>
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
          <ContainedLoader size={150} />
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
        .map((word, i) => {
          if (word.startsWith("@"))
            return <UserCard key={word + i} username={word} />;
          if (word.startsWith("https://"))
            return <PRLink key={word + i} link={word} />;
          return <Fragment key={word + i}>{`${word} `}</Fragment>;
        })}
    </>
  );
};

const Anchor = (props: JSX.IntrinsicElements["a"] & ExtraProps) => {
  return (
    <Text
      component="a"
      href={props.href}
      target="_black"
      color="indigo"
      fw="bold"
    >
      {props.children}
    </Text>
  );
};

const QuoteBlock = (
  props: JSX.IntrinsicElements["blockquote"] & ExtraProps
) => {
  return (
    <Blockquote
      color="indigo"
      sx={(theme) => ({ borderLeft: `5px solid ${theme.colors.gray[9]}` })}
    >
      {props.children}
    </Blockquote>
  );
};

const HorizontalRule = (_props: JSX.IntrinsicElements["hr"] & ExtraProps) => {
  return <Divider my="md" variant="dashed" />;
};

const Img = (props: JSX.IntrinsicElements["img"] & ExtraProps) => {
  return <Image src={props.src} alt={props.alt} width={"95%"} />;
};

// Markdown component set.
export const components: Components = {
  h1: Heading1,
  h2: Heading2,
  h3: Heading3,
  h4: Heading4,
  ul: UnorderedList,
  li: ListItem,
  p: Paragraph,
  code: CodeBlock,
  a: Anchor,
  blockquote: QuoteBlock,
  hr: HorizontalRule,
  img: Img,
};
