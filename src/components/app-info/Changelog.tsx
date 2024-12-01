import { Accordion, Badge, Box, Group, Text } from "@mantine/core";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useMemo } from "react";
import Markdown from "react-markdown";
import { useErrorHandler } from "../../hooks/error-handler";
import { getChangelog } from "../../services/app-info.service";
import ContainedLoader from "../loaders/ContainedLoader";
import { components } from "./MarkdownComponents";

export default function Changelog() {
  const { onError } = useErrorHandler();

  const { data, isLoading } = useQuery({
    queryKey: ["changelog"],
    staleTime: 10 * 60 * 1000,
    queryFn: getChangelog,
    onError,
  });

  const versions = useMemo(() => {
    if (!data) return [];
    return data.response.repository.releases.nodes;
  }, [data]);

  if (isLoading)
    return (
      <Box my="xl">
        <ContainedLoader size={150} />
      </Box>
    );

  return (
    <Accordion variant="separated" defaultValue={versions[0].tagName}>
      {versions.map((version) => (
        <Accordion.Item key={version.tagName} value={version.tagName} mt="md">
          <Accordion.Control>
            <Group spacing="xs">
              <Text component="h1" m={0} fz="lg" color="violet">
                {version.tagName}
              </Text>
              <Badge color="violet" size="sm" variant="outline">
                {dayjs(version.publishedAt).format("DD MMM 'YY, hh:mm a")}
              </Badge>
              {version.isDraft && (
                <Badge color="gray" size="sm" variant="dot">
                  Draft
                </Badge>
              )}
              {version.isPrerelease && (
                <Badge color="orange" size="sm" variant="dot">
                  Planned
                </Badge>
              )}
              {version.isLatest && (
                <Badge color="green" size="sm" variant="dot">
                  Latest
                </Badge>
              )}
            </Group>
          </Accordion.Control>
          <Accordion.Panel>
            <Markdown components={components}>{version.description}</Markdown>
          </Accordion.Panel>
        </Accordion.Item>
      ))}
    </Accordion>
  );
}
