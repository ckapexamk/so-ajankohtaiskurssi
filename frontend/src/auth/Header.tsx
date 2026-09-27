import React from "react";
import type { User } from "./ProtectedRoute";

interface HeaderProps {
  user: User;
  logout: () => void;
}
const Header = ({
  user,
  logout
}: HeaderProps): React.ReactElement => {
  return (
    <header style={{ display: "flex", gap: "1em" }}>
      <span>{user.display_name || user.email}</span>

      <button type="button" onClick={logout}>
        Logout
      </button>
    </header>
  );
};

export default Header;