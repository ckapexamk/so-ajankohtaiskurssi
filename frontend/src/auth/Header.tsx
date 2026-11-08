import React from "react";
import type { User } from "./ProtectedRoute";

import { AppShellHeader, Button, Group, Text } from "@mantine/core";

interface HeaderProps {
  user: User;
  logout: () => void;
}
const Header = ({
  user,
  logout
}: HeaderProps): React.ReactElement => {
  return (
    <AppShellHeader p="xs">
      <Group gap="lg">
      <Text fw={700} c="blue">{user.display_name || user.email}</Text>

      <Button variant="light"
        type="button"
        onClick={logout}>
        Logout
      </Button>
      </Group>
    </AppShellHeader>
  );
};

export default Header;