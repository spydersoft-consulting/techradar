import React, { useState, useRef, useMemo } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faBars, faUser, faSignInAlt, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { faMicrosoft as faMicrosoftBrand } from "@fortawesome/free-brands-svg-icons";
import { useAuth } from "../../context";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../store/store";
import { Menubar } from "primereact/menubar";
import { Button } from "primereact/button";
import { Sidebar } from "primereact/sidebar";
import { Menu } from "primereact/menu";
import { BreadCrumb } from "primereact/breadcrumb";

export interface NavigationBarProperties {
  brand?: string;
  children?: React.ReactNode;
}

export const NavigationBar: React.FunctionComponent<NavigationBarProperties> = (
  props: NavigationBarProperties,
): React.JSX.Element => {
  const [isSidebarVisible, setIsSidebarVisible] = useState(false);
  const { isAuthenticated, user } = useAuth();
  const menuRef = useRef<Menu>(null);
  const location = useLocation();
  const { radars } = useSelector((state: RootState) => state.radarlist);
  const { rings } = useSelector((state: RootState) => state.ringlist);
  const { quadrants } = useSelector((state: RootState) => state.quadlist);

  const getRadarName = (radarId: number) => {
    const radar = radars.find((r) => r.id === radarId);
    return radar ? radar.title || `Radar ${radarId}` : `Radar ${radarId}`;
  };

  const getEditLabel = (segment: string, index: number, pathSegments: string[]) => {
    if (segment !== "edit" || index === 0) {
      return null;
    }

    const previousSegment = pathSegments[index - 1];
    if (isNaN(Number(previousSegment)) || index <= 1) {
      return null;
    }

    const entityType = pathSegments[index - 2];
    if (entityType === "radar") {
      const radarId = parseInt(previousSegment);
      return `Edit ${getRadarName(radarId)}`;
    } else {
      return `Edit ${entityType.charAt(0).toUpperCase() + entityType.slice(0, -1)}`;
    }
  };

  const getSegmentLabel = (segment: string, index: number, pathSegments: string[]) => {
    const routeLabels: Record<string, string> = {
      item: "Items",
      arc: "Rings",
      quadrant: "Quadrants",
      newitem: "New Item",
      newarc: "New Ring",
      newquadrant: "New Quadrant",
      arcs: "Rings",
      quadrants: "Quadrants",
      items: "Items",
    };

    // Check for edit pages first
    const editLabel = getEditLabel(segment, index, pathSegments);
    if (editLabel) {
      return editLabel;
    }

    let label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

    // Special handling for radar IDs - try to get the radar name
    if (index > 0 && pathSegments[index - 1] === "radar" && !isNaN(Number(segment))) {
      const radarId = parseInt(segment);
      label = getRadarName(radarId);
    }

    return label;
  };

  const getRadarIdFromEntity = (segment: string, entityId: string) => {
    if (segment === "arc") {
      const ring = rings.find((r) => r.id === parseInt(entityId));
      return ring?.radarId;
    } else if (segment === "quadrant") {
      const quadrant = quadrants.find((q) => q.id === parseInt(entityId));
      return quadrant?.radarId;
    }
    return undefined;
  };

  const createSectionBreadcrumbs = (radarId: number, segment: string) => {
    const radarName = getRadarName(radarId);
    const sectionName = segment === "arc" || segment === "newarc" ? "Rings" : "Quadrants";
    const sectionPath = `/radar/${radarId}/${segment === "arc" || segment === "newarc" ? "arcs" : "quadrants"}`;

    return [
      {
        label: radarName,
        command: () => {
          window.location.href = `/radar/${radarId}`;
        },
      },
      {
        label: sectionName,
        command: () => {
          window.location.href = sectionPath;
        },
      },
    ];
  };

  const breadcrumbItems = useMemo(() => {
    const pathSegments = location.pathname.split("/").filter((segment) => segment !== "");

    // Handle special cases for edit and new pages
    // For paths like /arc/123 or /quadrant/456, we need contextual breadcrumbs
    if (pathSegments.length === 2 && (pathSegments[0] === "arc" || pathSegments[0] === "quadrant")) {
      const segment = pathSegments[0];
      const entityId = pathSegments[1];
      if (!isNaN(Number(entityId))) {
        const radarId = getRadarIdFromEntity(segment, entityId);
        if (radarId) {
          const contextualBreadcrumbs = createSectionBreadcrumbs(radarId, segment);
          const editLabel = getEditLabel(segment, 0, pathSegments);
          return [...contextualBreadcrumbs, { label: editLabel || "Edit" }];
        }
      }
    }

    // For paths like /radar/123/newarc or /radar/123/newquadrant
    if (
      pathSegments.length === 3 &&
      pathSegments[0] === "radar" &&
      (pathSegments[2] === "newarc" || pathSegments[2] === "newquadrant")
    ) {
      const radarId = parseInt(pathSegments[1]);
      const segment = pathSegments[2];
      if (!isNaN(radarId)) {
        const contextualBreadcrumbs = createSectionBreadcrumbs(radarId, segment);
        const newLabel = segment === "newarc" ? "New Ring" : "New Quadrant";
        return [...contextualBreadcrumbs, { label: newLabel }];
      }
    }

    // Regular breadcrumb processing for other paths
    const items = pathSegments
      .map((segment, index) => {
        // Skip "radar" segment as it's redundant with Home
        if (segment === "radar") {
          return null;
        }

        const path = "/" + pathSegments.slice(0, index + 1).join("/");
        const label = getSegmentLabel(segment, index, pathSegments);

        // Don't make the last item clickable
        if (index === pathSegments.length - 1) {
          return { label };
        }

        return {
          label,
          command: () => {
            window.location.href = path;
          },
        };
      })
      .filter((item): item is NonNullable<typeof item> => item !== null);

    return items;
  }, [location.pathname, radars, rings, quadrants]);

  const breadcrumbHome = {
    icon: "pi pi-home",
    command: () => {
      window.location.href = "/";
    },
  };

  const getAuthMenuItems = () => {
    if (isAuthenticated) {
      return [
        {
          label: user?.name || "User",
          icon: <FontAwesomeIcon icon={faUser} />,
          command: () => {
            window.location.href = "/profile";
          },
        },
        {
          separator: true,
        },
        {
          label: "Log out",
          icon: <FontAwesomeIcon icon={faSignOutAlt} />,
          command: () => {
            window.location.href = "/auth/logout";
          },
        },
      ];
    }

    return [
      {
        label: "Login",
        icon: <FontAwesomeIcon icon={faSignInAlt} />,
        command: () => {
          window.location.href = "/.auth/login";
        },
      },
    ];
  };

  const showAuthMenu = (event: React.MouseEvent) => {
    menuRef.current?.toggle(event);
  };

  const menuItems = [
    {
      label: "Home",
      icon: <FontAwesomeIcon icon={faHome} className="mr-1" />,
      command: () => {
        window.location.href = "/";
      },
    },
  ];

  const brandTemplate = (
    <div className="flex items-center">
      <span className="text-xl font-bold">{props.brand ?? "Brand"}</span>
    </div>
  );

  const endTemplate = (
    <div className="flex items-center">
      <Button
        icon={<FontAwesomeIcon icon={faMicrosoftBrand} />}
        className="p-button-text p-button-plain"
        onClick={showAuthMenu}
        aria-label="User menu"
        tooltip={isAuthenticated ? user?.name || "User" : "Login"}
        tooltipOptions={{ position: "bottom" }}
      />
      <Menu model={getAuthMenuItems()} popup ref={menuRef} className="w-48" />
    </div>
  );

  return (
    <>
      <div className="hidden md:block">
        <Menubar model={menuItems} start={brandTemplate} end={endTemplate} />
      </div>

      <div className="md:hidden">
        <div className="p-menubar p-component">
          <div className="p-menubar-start">{brandTemplate}</div>
          <div className="p-menubar-end">
            <Button
              icon={<FontAwesomeIcon icon={faBars} />}
              className="p-button-text p-button-plain"
              onClick={() => setIsSidebarVisible(true)}
              aria-label="Open menu"
            />
          </div>
        </div>
      </div>

      {/* Breadcrumb - only show if not on home page */}
      {location.pathname !== "/" && breadcrumbItems.length > 0 && (
        <div className="bg-gray-50 border-b px-4 py-2">
          <BreadCrumb model={breadcrumbItems} home={breadcrumbHome} className="border-none bg-transparent" />
        </div>
      )}

      <Sidebar visible={isSidebarVisible} onHide={() => setIsSidebarVisible(false)} position="right" className="w-80">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold mb-4">Menu</h3>
          <div className="space-y-2">
            <button
              type="button"
              className="w-full flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors text-left bg-transparent border-none cursor-pointer"
              onClick={() => {
                window.location.href = "/";
                setIsSidebarVisible(false);
              }}
            >
              <FontAwesomeIcon icon={faHome} className="mr-2" />
              Home
            </button>
            {props.children}
          </div>
          <div className="border-t pt-4">
            <div className="space-y-2">
              {getAuthMenuItems().map((item) => {
                if (item.separator) {
                  return <hr key="separator" className="my-2" />;
                }
                return (
                  <button
                    key={item.label}
                    type="button"
                    className="w-full flex items-center p-3 hover:bg-gray-100 rounded-md transition-colors text-left bg-transparent border-none cursor-pointer"
                    onClick={() => {
                      item.command?.();
                      setIsSidebarVisible(false);
                    }}
                  >
                    <span className="mr-2">{item.icon}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Sidebar>
    </>
  );
};
