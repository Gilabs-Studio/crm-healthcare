"use client";

import { useState, useEffect } from "react";
import { useSearchProcedures } from "../hooks/useProcedures";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Procedure } from "../types";

interface ProcedureSelectorProps {
  readonly value?: string;
  readonly onSelect: (procedure: Procedure | null) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function ProcedureSelector({
  value,
  onSelect,
  placeholder = "Select procedure...",
  disabled = false,
}: ProcedureSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProcedure, setSelectedProcedure] = useState<Procedure | null>(null);

  const { data: searchData, isLoading } = useSearchProcedures({
    query: searchQuery,
    limit: 20,
    status: "active",
  });

  const procedures = searchData?.data || [];

  useEffect(() => {
    if (value && procedures.length > 0) {
      const found = procedures.find((p) => p.id === value);
      if (found) {
        setSelectedProcedure(found);
      }
    } else if (!value) {
      setSelectedProcedure(null);
    }
  }, [value, procedures]);

  const handleSelect = (procedure: Procedure) => {
    setSelectedProcedure(procedure);
    onSelect(procedure);
    setOpen(false);
    setSearchQuery("");
  };

  const formatPrice = (price?: number) => {
    if (!price) return "";
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {selectedProcedure
            ? `${selectedProcedure.code} - ${selectedProcedure.name}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search procedure..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No procedure found."}
            </CommandEmpty>
            <CommandGroup>
              {procedures.map((procedure) => (
                <CommandItem
                  key={procedure.id}
                  value={`${procedure.code} ${procedure.name}`}
                  onSelect={() => handleSelect(procedure)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedProcedure?.id === procedure.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">
                      {procedure.code} - {procedure.name}
                    </span>
                    {procedure.price && (
                      <span className="text-xs text-muted-foreground">
                        {formatPrice(procedure.price)}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

