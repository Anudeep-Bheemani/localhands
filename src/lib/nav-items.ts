export type NavIconName =
  | "home" | "compass" | "briefcase" | "listTodo" | "heart" | "bookMarked"
  | "layoutDashboard" | "calendarClock" | "star" | "userCircle";

export type NavItem = { href: string; label: string; icon: NavIconName };

export const CUSTOMER_NAV: NavItem[] = [
  { href: "/customer", label: "Home", icon: "home" },
  { href: "/customer/browse", label: "Browse", icon: "compass" },
  { href: "/customer/jobs", label: "My Jobs", icon: "briefcase" },
  { href: "/customer/custom-jobs", label: "Custom Jobs", icon: "listTodo" },
  { href: "/customer/favorites", label: "Favorites", icon: "heart" },
  { href: "/customer/passport", label: "Home Passport", icon: "bookMarked" },
];

export const WORKER_NAV: NavItem[] = [
  { href: "/worker", label: "Dashboard", icon: "layoutDashboard" },
  { href: "/worker/schedule", label: "Schedule", icon: "calendarClock" },
  { href: "/worker/jobs", label: "Jobs", icon: "briefcase" },
  { href: "/worker/custom-jobs", label: "Custom Jobs", icon: "listTodo" },
  { href: "/worker/reviews", label: "Reviews", icon: "star" },
  { href: "/worker/profile", label: "Profile", icon: "userCircle" },
];
