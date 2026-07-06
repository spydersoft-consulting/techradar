import React, { useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMicrosoft } from "@fortawesome/free-brands-svg-icons/faMicrosoft";
import { useAuth } from "../../context";
import { Menu } from "primereact/menu";
import { Button } from "primereact/button";

// Log In, Log Out button
export const AuthenticationMenu = (): React.JSX.Element => {
  const { isAuthenticated, user } = useAuth();
  const menuRef = useRef<Menu>(null);

  const getMenuItems = () => {
    if (isAuthenticated) {
      return [
        {
          label: user?.name || "User",
          icon: "pi pi-user",
          command: () => {
            window.location.href = "/profile";
          },
        },
        {
          separator: true,
        },
        {
          label: "Log out",
          icon: "pi pi-sign-out",
          command: () => {
            window.location.href = "/auth/logout";
          },
        },
      ];
    }

    return [
      {
        label: "Login",
        icon: "pi pi-sign-in",
        command: () => {
          window.location.href = "/.auth/login";
        },
      },
    ];
  };

  const showMenu = (event: React.MouseEvent) => {
    menuRef.current?.toggle(event);
  };

  return (
    <div className="flex items-center">
      <Button
        icon={<FontAwesomeIcon icon={faMicrosoft} />}
        className="p-button-text p-button-plain"
        onClick={showMenu}
        aria-label="User menu"
        tooltip={isAuthenticated ? user?.name || "User" : "Login"}
        tooltipOptions={{ position: "bottom" }}
      />
      <Menu model={getMenuItems()} popup ref={menuRef} className="w-48" />
    </div>
  );
};
