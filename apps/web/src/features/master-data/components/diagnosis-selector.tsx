"use client";

import { useState, useEffect } from "react";
import { useSearchDiagnoses } from "../hooks/useDiagnoses";
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
import type { Diagnosis } from "../types";

interface DiagnosisSelectorProps {
  readonly value?: string;
  readonly onSelect: (diagnosis: Diagnosis | null) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function DiagnosisSelector({
  value,
  onSelect,
  placeholder = "Select diagnosis...",
  disabled = false,
}: DiagnosisSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDiagnosis, setSelectedDiagnosis] = useState<Diagnosis | null>(null);

  const { data: searchData, isLoading } = useSearchDiagnoses({
    query: searchQuery,
    limit: 20,
    status: "active",
  });

  const diagnoses = searchData?.data || [];

  useEffect(() => {
    if (value && diagnoses.length > 0) {
      const found = diagnoses.find((d) => d.id === value);
      if (found) {
        setSelectedDiagnosis(found);
      }
    } else if (!value) {
      setSelectedDiagnosis(null);
    }
  }, [value, diagnoses]);

  const handleSelect = (diagnosis: Diagnosis) => {
    setSelectedDiagnosis(diagnosis);
    onSelect(diagnosis);
    setOpen(false);
    setSearchQuery("");
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
          {selectedDiagnosis
            ? `${selectedDiagnosis.code} - ${selectedDiagnosis.name}`
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command>
          <CommandInput
            placeholder="Search diagnosis..."
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList>
            <CommandEmpty>
              {isLoading ? "Loading..." : "No diagnosis found."}
            </CommandEmpty>
            <CommandGroup>
              {diagnoses.map((diagnosis) => (
                <CommandItem
                  key={diagnosis.id}
                  value={`${diagnosis.code} ${diagnosis.name}`}
                  onSelect={() => handleSelect(diagnosis)}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedDiagnosis?.id === diagnosis.id
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {diagnosis.code} - {diagnosis.name}
                    </span>
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

