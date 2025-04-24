"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import useLogout from "@/hooks/useLogout";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  Home,
  Inbox,
  LogOut,
  Users2,
  Book,
  SquarePlus,
  History,
} from "lucide-react";
import { useState } from "react";

const items = [
  {
    title: "Dashboard",
    url: "/admin/dashboard",
    icon: Home,
  },
  {
    title: "Books",
    url: "/admin/books",
    icon: Book,
    children: [
      {
        title: "Add New Book",
        url: "/admin/books/create",
        icon: SquarePlus,
      },
      {
        title: "Manage Books",
        url: "/admin/books",
        icon: Book,
      },
    ],
  },
  {
    title: "History",
    url: "/admin/history",
    icon: History,
  },
  {
    title: "Messages",
    url: "/admin/messages",
    icon: Inbox,
  },
  {
    title: "Users",
    url: "#",
    icon: Users2,
    children: [
      {
        title: "Manage Users",
        url: "/admin/users",
        icon: Users2,
      },
    ],
  },
];

export function AdminSidebar() {
  const [open, setOpen] = useState<{ [key: string]: boolean }>({});
  const logout = useLogout();

  const toggleCollapse = (title: string) => {
    setOpen((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <Sidebar>
      <SidebarContent className="bg-gray-800 text-sm">
        <aside className="w-64 bg-gray-800 text-white p-4">
          <nav>
            {items.map((item) =>
              item.children ? (
                <Collapsible key={item.title} open={open[item.title]}>
                  <CollapsibleTrigger
                    className="flex items-center justify-between w-full px-4 py-2 rounded-lg hover:bg-gray-800"
                    onClick={() => toggleCollapse(item.title)}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      {item.title}
                    </div>
                    <ChevronDown
                      className={cn(
                        "w-5 h-5 transition-transform",
                        open[item.title] ? "rotate-180" : "rotate-0"
                      )}
                    />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="ml-6">
                    {item.children.map((child) => (
                      <a
                        key={child.title}
                        href={child.url}
                        className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800"
                      >
                        <child.icon className="w-4 h-4 opacity-70" />
                        {child.title}
                      </a>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              ) : (
                <a
                  key={item.title}
                  href={item.url}
                  className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800"
                >
                  <item.icon className="w-5 h-5" />
                  {item.title}
                </a>
              )
            )}
            <a
              href="#"
              className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-gray-800"
              onClick={logout}
            >
              <LogOut className="w-5 h-5" /> Logout
            </a>
          </nav>
        </aside>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
