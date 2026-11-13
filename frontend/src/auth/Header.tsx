import { Link, useLocation } from "react-router";
import type { User } from "./ProtectedRoute";

import { AppShellHeader, Button, Group, Tabs, Text } from "@mantine/core";

interface HeaderProps {
  user: User;
  logout: () => void;
}
const Header = ({
  user,
  logout
}: HeaderProps): React.ReactElement => {
  const { pathname } = useLocation();
  return (
    <AppShellHeader p="xs">
    <Group justify="center">

      <Group gap="lg" flex={1}>
        <Button variant="light"
          type="button"
          onClick={logout}>
          Logout
        </Button>
        <Text fw={700} c="blue">{user.display_name || user.email}</Text> 
      </Group>

      <Group flex={2} pt="0.9em">
      <Tabs value={pathname} variant="outline">
        <Tabs.List aria-label="Main navigation">
          <Tabs.Tab value="/" renderRoot={(props) => (
            <Link to="/" {...props} />
          )}>Dashboard
          </Tabs.Tab>
          <Tabs.Tab value="/sessions" renderRoot={(props) => (
            <Link to="/sessions" {...props} />
          )}>Sessions
          </Tabs.Tab>
          <Tabs.Tab value="/plans" renderRoot={(props) => (
            <Link to="/plans" {...props} />
          )}>Plans
          </Tabs.Tab>
          <Tabs.Tab value="/calendar" renderRoot={(props) => (
            <Link to="/calendar" {...props} />
          )}>Calendar
          </Tabs.Tab>
          <Tabs.Tab value="/progress" renderRoot={(props) => (
            <Link to="/progress" {...props} />
          )}>Progress
          </Tabs.Tab>

        </Tabs.List>
      </Tabs>
      </Group>

    </Group>
    </AppShellHeader>
  );
};

export default Header;