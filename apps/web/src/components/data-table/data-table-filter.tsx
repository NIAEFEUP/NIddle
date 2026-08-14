import { ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { cn, getInitials } from "@/lib/utils";

export interface DataTableFilterOption {
  value: string;
  label: string;
  description?: string;
  initials?: string;
  icon?: React.ReactNode;
}

export interface DataTableFilterProps {
  title: string;
  pluralTitle?: string;
  allLabel?: string;
  options: DataTableFilterOption[];
  selectedValues: string[];
  onSelectedValuesChange: (values: string[]) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
}

function sortOptionsWithSelectedFirst(
  items: DataTableFilterOption[],
  selectedValues: string[],
): DataTableFilterOption[] {
  const selectedSet = new Set(selectedValues);
  const selected = items.filter((opt) => selectedSet.has(opt.value));
  const unselected = items.filter((opt) => !selectedSet.has(opt.value));
  return [...selected, ...unselected];
}

export function DataTableFilter({
  title,
  pluralTitle,
  allLabel,
  options,
  selectedValues,
  onSelectedValuesChange,
  searchPlaceholder,
  emptyMessage,
  disabled = false,
  className,
}: DataTableFilterProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [orderedOptions, setOrderedOptions] = React.useState<
    DataTableFilterOption[]
  >(() => sortOptionsWithSelectedFirst(options, selectedValues));

  React.useEffect(() => {
    if (!isOpen) {
      setOrderedOptions(sortOptionsWithSelectedFirst(options, selectedValues));
      setSearch("");
    }
  }, [isOpen, options, selectedValues]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setOrderedOptions(sortOptionsWithSelectedFirst(options, selectedValues));
    }
    setIsOpen(nextOpen);
  };

  const toggleOption = (value: string) => {
    const next = selectedValues.includes(value)
      ? selectedValues.filter((v) => v !== value)
      : [...selectedValues, value];
    onSelectedValuesChange(next);
  };

  const clearAll = () => {
    onSelectedValuesChange([]);
  };

  const filteredOptions = React.useMemo(() => {
    if (!search.trim()) return orderedOptions;
    const query = search.toLowerCase().trim();
    return orderedOptions.filter(
      (opt) =>
        opt.label.toLowerCase().includes(query) ||
        opt.description?.toLowerCase().includes(query),
    );
  }, [orderedOptions, search]);

  const selectedOptions = React.useMemo(() => {
    const selectedSet = new Set(selectedValues);
    return options.filter((opt) => selectedSet.has(opt.value));
  }, [options, selectedValues]);

  const plural = pluralTitle || `${title}s`;
  const defaultAllLabel = allLabel || `All ${plural}`;

  return (
    <DropdownMenu open={isOpen} onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={isOpen}
            className={cn(
              "h-8 justify-between font-normal px-3 text-xs border-input hover:bg-accent/50 gap-1.5",
              className,
            )}
            disabled={disabled || options.length === 0}
          >
            <span className="text-muted-foreground">Filter by {title}</span>
            {selectedValues.length === 0 ? (
              <span className="font-medium text-foreground">
                {defaultAllLabel}
              </span>
            ) : selectedValues.length === 1 ? (
              <span className="truncate max-w-40 font-medium text-foreground">
                {selectedOptions[0]?.label || selectedValues[0]}
              </span>
            ) : (
              <span className="font-medium text-foreground">
                {selectedValues.length} selected
              </span>
            )}
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50 ml-1" />
          </Button>
        }
      />
      <DropdownMenuContent
        className="w-(--anchor-width) min-w-72 p-2"
        align="start"
        sideOffset={4}
      >
        <div className="flex flex-row items-center justify-between gap-2 p-1.5">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <Input
              placeholder={
                searchPlaceholder || `Search ${plural.toLowerCase()}...`
              }
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="h-8 pl-8 pr-2 text-xs"
              autoFocus
            />
          </div>
          {selectedValues.length > 0 && (
            <button
              type="button"
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer shrink-0 transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                clearAll();
              }}
            >
              Clear all
            </button>
          )}
        </div>
        <DropdownMenuGroup>
          <div className="max-h-52 overflow-y-auto space-y-0.5 mt-1">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                {emptyMessage || `No ${plural.toLowerCase()} found`}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <DropdownMenuCheckboxItem
                    key={opt.value}
                    checked={isSelected}
                    closeOnClick={false}
                    onCheckedChange={() => toggleOption(opt.value)}
                    className="gap-2.5 py-1.5 px-2 cursor-pointer rounded-md"
                  >
                    {opt.icon ? (
                      <div className="flex h-6 w-6 items-center justify-center rounded-sm bg-primary/10 text-primary text-[10px] shrink-0 font-semibold">
                        {opt.icon}
                      </div>
                    ) : (
                      <Avatar className="h-6 w-6 rounded-sm shrink-0 after:rounded-sm">
                        <AvatarFallback className="rounded-sm bg-primary/10 text-primary text-[10px] font-semibold">
                          {opt.initials || getInitials(opt.label)}
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className="flex flex-col flex-1 min-w-0 pr-2">
                      <span className="font-medium text-xs truncate">
                        {opt.label}
                      </span>
                      {opt.description && (
                        <span className="text-[10px] text-muted-foreground truncate">
                          {opt.description}
                        </span>
                      )}
                    </div>
                  </DropdownMenuCheckboxItem>
                );
              })
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
