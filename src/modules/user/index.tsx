import { Accordion, Divider, Group, Text } from "@mantine/core";
import { useDocumentTitle } from "@mantine/hooks";
import dayjs from "dayjs";
import React from "react";
import { APP_TITLE } from "../../constants/app";
import { useCurrentUser } from "../../context/user.context";
import ChangePassword from "./ChangePassword";
import ExpenseWindow from "./ExpenseWindow";

export default function User() {
  useDocumentTitle(`${APP_TITLE} | My Account`);

  const { userData } = useCurrentUser();

  return (
    <Accordion variant="separated" defaultValue="details">
      <Accordion.Item value="details">
        <Accordion.Control>Account Info</Accordion.Control>
        <Accordion.Panel>
          <Text fz="2rem" fw="bold" fs="italic">
            {userData?.userName}
          </Text>
          <Group spacing="sm">
            <Text component="p" m={0} fz="xs">
              <Text component="span" color="dimmed">
                Member Since:{" "}
              </Text>
              <Text component="span" fw="bold">
                {dayjs(userData?.createdAt).format("DD MMM 'YY")}
              </Text>
            </Text>
            {userData?.createdAt !== userData?.updatedAt && (
              <>
                <Divider
                  orientation="vertical"
                  variant="solid"
                  color="indigo"
                />
                <Text component="p" m={0} fz="xs">
                  <Text component="span" color="dimmed">
                    Last Updated:{" "}
                  </Text>
                  <Text component="span" fw="bold">
                    {dayjs(userData?.updatedAt).format("DD MMM' YY")}
                  </Text>
                </Text>
              </>
            )}
          </Group>
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="password">
        <Accordion.Control>Change Password</Accordion.Control>
        <Accordion.Panel>
          <ChangePassword />
        </Accordion.Panel>
      </Accordion.Item>
      <Accordion.Item value="expense-window">
        <Accordion.Control>Expense Edit Window</Accordion.Control>
        <Accordion.Panel>
          <ExpenseWindow />
        </Accordion.Panel>
      </Accordion.Item>
    </Accordion>
  );
}
