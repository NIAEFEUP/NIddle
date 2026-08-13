import { ChevronsUpDown } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const associations = [
  {
    acronym: "NIAEFEUP",
    name: "Núcleo de Informática da Associação de Estudantes da Faculdade de Engenharia da Universidade do Porto",
  },
  {
    acronym: "AEFEUP",
    name: "Associação de Estudantes da Faculdade de Engenharia da Universidade do Porto",
  },
  {
    acronym: "AEFLUP",
    name: "Associação de Estudantes da Faculdade de Letras da Universidade do Porto",
  },
];

export function SidebarHeaderComponent() {
  const { isMobile } = useSidebar();
  const [activeAssociation, setActiveAssociation] = React.useState(
    associations[0],
  );

  if (!activeAssociation) {
    return null;
  }

  const getInitials = (name: string) => {
    return (
      name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase() || "T"
    );
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton
                size="lg"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg after:rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold">
                    {getInitials(activeAssociation.acronym)}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-medium">
                    {activeAssociation.acronym}
                  </span>
                  <span className="truncate text-xs text-muted-foreground">
                    {activeAssociation.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            className="min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
              Associations
            </div>
            {associations.map((association, index) => (
              <DropdownMenuItem
                key={association.acronym}
                onClick={() => setActiveAssociation(association)}
                className="gap-2 p-2 cursor-pointer"
              >
                <Avatar className="h-6 w-6 rounded-sm after:rounded-sm">
                  <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-xs font-semibold">
                    {getInitials(association.acronym)}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium text-sm">
                  {association.acronym}
                </span>
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
