import { 
  Users, 
  Building2, 
  Trophy, 
  Settings, 
  LayoutDashboard,
  FileText,
  MessageSquare
} from "lucide-react";

export const adminNavigation = [
  {
    title: "Áttekintés",
    items: [
      {
        title: "Vezérlőpult",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Klub Jelentkezések",
        href: "/admin/applications",
        icon: FileText,
      }
    ]
  },
  {
    title: "Kezelés",
    items: [
      {
        title: "Felhasználók",
        href: "/admin/users",
        icon: Users,
      },
      {
        title: "Klubok",
        href: "/admin/clubs",
        icon: Building2,
      },
      {
        title: "Versenyek",
        href: "/admin/tournaments",
        icon: Trophy,
      }
    ]
  },
  {
    title: "Rendszer",
    items: [
      {
        title: "Email & Hírlevél",
        href: "/admin/mailer",
        icon: MessageSquare,
      },
      {
        title: "Beállítások",
        href: "/admin/settings",
        icon: Settings,
      }
    ]
  }
];
