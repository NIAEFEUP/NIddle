import { ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { FacultyOrCourse } from "@/hooks/use-faculty-course-options";

const NONE_VALUE = "__none__";

function entityLabel(entity: FacultyOrCourse) {
  return entity.acronym ? `${entity.acronym} — ${entity.name}` : entity.name;
}

export interface EntitySelectProps {
  id?: string;
  options: FacultyOrCourse[];
  value: string | null;
  onValueChange: (value: string | null) => void;
  placeholder: string;
  /** Label for the "no selection" option; omit to make a selection required. */
  noneLabel?: string;
  disabled?: boolean;
}

export function EntitySelect({
  id,
  options,
  value,
  onValueChange,
  placeholder,
  noneLabel,
  disabled,
}: EntitySelectProps) {
  const items = React.useMemo(
    () => [
      ...(noneLabel ? [{ value: NONE_VALUE, label: noneLabel }] : []),
      ...options.map((option) => ({
        value: String(option.id),
        label: entityLabel(option),
      })),
    ],
    [options, noneLabel],
  );

  return (
    <Select
      items={items}
      value={value ?? (noneLabel ? NONE_VALUE : null)}
      onValueChange={(next) =>
        onValueChange(!next || next === NONE_VALUE ? null : String(next))
      }
      disabled={disabled}
    >
      <SelectTrigger id={id} className="h-9 w-full text-xs">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value} className="text-xs">
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export interface EntityMultiSelectProps {
  options: FacultyOrCourse[];
  value: string[];
  onValueChange: (value: string[]) => void;
  placeholder: string;
  pluralLabel: string;
  disabled?: boolean;
}

export function EntityMultiSelect({
  options,
  value,
  onValueChange,
  placeholder,
  pluralLabel,
  disabled,
}: EntityMultiSelectProps) {
  const [search, setSearch] = React.useState("");
  const selected = options.filter((option) =>
    value.includes(String(option.id)),
  );

  const query = search.toLowerCase().trim();
  const filtered = query
    ? options.filter(
        (option) =>
          option.name.toLowerCase().includes(query) ||
          option.acronym?.toLowerCase().includes(query),
      )
    : options;

  const toggle = (id: string) =>
    onValueChange(
      value.includes(id) ? value.filter((v) => v !== id) : [...value, id],
    );

  return (
    <DropdownMenu onOpenChange={(open) => !open && setSearch("")}>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="outline"
            role="combobox"
            className="w-full justify-between font-normal h-9 px-3 text-xs border-input hover:bg-accent/50"
            disabled={disabled || options.length === 0}
          >
            {selected.length === 0 ? (
              <span className="text-muted-foreground font-medium">
                {options.length === 0
                  ? `No ${pluralLabel} available`
                  : placeholder}
              </span>
            ) : (
              <span className="truncate text-foreground font-medium">
                {selected.length <= 3
                  ? selected.map((s) => s.acronym || s.name).join(", ")
                  : `${selected.length} ${pluralLabel} selected`}
              </span>
            )}
            <ChevronsUpDown className="size-3.5 shrink-0 opacity-50 ml-2" />
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
              placeholder={`Search ${pluralLabel}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.stopPropagation()}
              className="h-8 pl-8 pr-2 text-xs"
              autoFocus
            />
          </div>
          {value.length > 0 && (
            <button
              type="button"
              className="text-[11px] text-muted-foreground hover:text-foreground font-medium cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                onValueChange([]);
              }}
            >
              Clear all
            </button>
          )}
        </div>
        <DropdownMenuGroup>
          <div className="max-h-52 overflow-y-auto space-y-0.5 mt-1">
            {filtered.length === 0 ? (
              <div className="py-6 text-center text-xs text-muted-foreground">
                No {pluralLabel} found
              </div>
            ) : (
              filtered.map((option) => (
                <DropdownMenuCheckboxItem
                  key={option.id}
                  checked={value.includes(String(option.id))}
                  closeOnClick={false}
                  onCheckedChange={() => toggle(String(option.id))}
                >
                  <div className="flex flex-col flex-1 min-w-0 pr-2">
                    <span className="font-medium text-xs truncate">
                      {option.acronym || option.name}
                    </span>
                    {option.acronym && option.acronym !== option.name && (
                      <span className="text-[10px] text-muted-foreground truncate">
                        {option.name}
                      </span>
                    )}
                  </div>
                </DropdownMenuCheckboxItem>
              ))
            )}
          </div>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
