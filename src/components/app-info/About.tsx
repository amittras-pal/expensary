import { Container, Group, Loader } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import { useQuery } from "@tanstack/react-query";
import Markdown from "react-markdown";
import { useLocation } from "react-router-dom";
import { APP_TITLE } from "../../constants/app";
import { getAboutFile } from "../../services/app-info.service";
import "./About.scss";
import { components } from "./MarkdownComponents";

export default function About() {
  useDocumentTitle(`${APP_TITLE} | About`);
  const { pathname } = useLocation();
  const { isLoading, data } = useQuery({
    queryKey: ["about-app"],
    queryFn: getAboutFile,
    staleTime: 10 * 60 * 1000,
  });

  return isLoading ? (
    <Group position="center">
      <Loader />
    </Group>
  ) : (
    <Container
      size="md"
      className="about-content"
      py={pathname.endsWith("app") ? 0 : "lg"}
    >
      <Markdown components={components}>{data}</Markdown>
    </Container>
  );
}