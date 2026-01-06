export interface NavigationItem {
  title: string;
  icon: string;
  route: string;
  selected?: boolean;
  permission?: string; // Optional permission key for role-based access
  adminOnly?: boolean; // Flag to indicate admin-only access
}

export interface NavigationGroup {
  title: string;
  icon: string;
  permission?: string; // Optional permission key for the entire group
  adminOnly?: boolean; // Flag to indicate admin-only group
  children: NavigationItem[];
}

// Admin navigation configuration
export const adminNavigationConfig: NavigationGroup[] = [
  {
    title: "Home",
    icon: "mdi-home",
    children: [
      {
        title: "Dashboard",
        icon: "mdi-view-dashboard",
        route: "/account/home",
      },
    ],
  },
  {
    title: "Admin Controls",
    icon: "mdi-cog",
    adminOnly: true,
    permission: "admin.access",
    children: [
      {
        title: "User Management",
        icon: "mdi-account-multiple",
        route: "/admin/user-management",
        permission: "admin.users.manage",
        adminOnly: true,
      },
      {
        title: "User Roles",
        icon: "mdi-account-key",
        route: "/admin/user-roles",
        permission: "admin.roles.manage",
        adminOnly: true,
      },
      {
        title: "Report Management",
        icon: "mdi-file-document-alert",
        route: "/admin/report-management",
        permission: "admin.reports.manage",
        adminOnly: true,
      },
    ],
  },
];

// Student/Non-admin navigation configuration
export const studentNavigationConfig: NavigationGroup[] = [
  {
    title: "Home",
    icon: "mdi-home",
    children: [
      {
        title: "Dashboard",
        icon: "mdi-view-dashboard",
        route: "/account/home",
      },
      {
        title: "My Reports",
        icon: "mdi-file-document-multiple",
        route: "/student/my-reports",
      },
    ],
  },
  {
    title: "More",
    icon: "mdi-dots-horizontal",
    children: [
      {
        title: "Profile Settings",
        icon: "mdi-account-cog",
        route: "/account/profile-settings",
      },
    ],
  },
];

// Legacy navigation config for backward compatibility
export const navigationConfig: NavigationGroup[] = adminNavigationConfig;

// Helper function to get all permissions from navigation config
export const getAllPermissions = (): string[] => {
  const permissions: string[] = [];

  navigationConfig.forEach((group) => {
    if (group.permission) {
      permissions.push(group.permission);
    }

    group.children.forEach((item) => {
      if (item.permission) {
        permissions.push(item.permission);
      }
    });
  });

  return [...new Set(permissions)]; // Remove duplicates
};

// Helper function to get navigation items with selected state
export const getNavigationWithSelection = (
  selectedPermissions: string[] = []
): NavigationGroup[] => {
  return navigationConfig.map((group) => ({
    ...group,
    children: group.children.map((item) => ({
      ...item,
      selected: selectedPermissions.includes(item.permission || item.route),
    })),
  }));
};
