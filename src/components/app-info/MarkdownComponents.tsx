import { Code, HoverCard, List, Text } from "@mantine/core";
import { Fragment, PropsWithChildren } from "react";
import { Components, ExtraProps } from "react-markdown";

const CodeBlock = (props: JSX.IntrinsicElements["code"] & ExtraProps) => {
  return <Code>{props.children}</Code>;
};

const Heading = (props: JSX.IntrinsicElements["h2"] & ExtraProps) => {
  return (
    <Text component="h2">
      <AddLinksInGFM>{props.children}</AddLinksInGFM>
    </Text>
  );
};

const UnorderedList = (props: JSX.IntrinsicElements["ul"] & ExtraProps) => {
  return <List>{props.children}</List>;
};

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

const UserCard = (props: Readonly<{ username: string }>) => {
  return (
    <HoverCard width={200} position="bottom" shadow="md" withinPortal>
      <HoverCard.Target>
        <Text component="span" sx={{ cursor: "pointer" }} color="yellow">
          {props.username + " "}
        </Text>
      </HoverCard.Target>
      <HoverCard.Dropdown>
        <Text size="sm">{props.username} Details will be loaded here.</Text>
      </HoverCard.Dropdown>
    </HoverCard>
  );
};

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

export const components: Partial<Components> = {
  h1: Heading,
  h2: Heading,
  h3: Heading,
  h4: Heading,
  ul: UnorderedList,
  li: ListItem,
  p: Paragraph,
  code: CodeBlock,
};
