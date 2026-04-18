"use client"

import * as React from "react"
import { Check, ChevronsUpDown } from "lucide-react"

import { cn } from "@omnicore/ui/lib/utils"
import { Button } from "@omnicore/ui/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@omnicore/ui/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@omnicore/ui/components/ui/popover"

export interface ComboboxOption {
  value: string
  label: string
}

interface DebouncedComboboxProps {
  value: string
  onValueChange: (value: string) => void
  onSearch: (searchTerm: string) => void
  options: ComboboxOption[]
  placeholder?: string
  searchPlaceholder?: string
  emptyMessage?: string
  disabled?: boolean
  className?: string
  debounceTime?: number
}

export function DebouncedCombobox({
  value,
  onValueChange,
  onSearch,
  options,
  placeholder = "Seçiniz...",
  searchPlaceholder = "Arama yapın...",
  emptyMessage = "Sonuç bulunamadı.",
  disabled = false,
  className,
  debounceTime = 300,
}: DebouncedComboboxProps) {
  const [open, setOpen] = React.useState(false)
  const [searchTerm, setSearchTerm] = React.useState("")

  React.useEffect(() => {
    const timer = setTimeout(() => {
      onSearch(searchTerm)
    }, debounceTime)

    return () => clearTimeout(timer)
  }, [searchTerm, onSearch, debounceTime])

  const selectedOption = React.useMemo(
    () => options.find((option) => option.value === value),
    [options, value]
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            "w-full justify-between bg-white",
            !value && "text-slate-500",
            className
          )}
        >
          {value
            ? selectedOption?.label || "Seçilen öğe bulunamadı"
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder={searchPlaceholder}
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.value}
                  value={option.value}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue === value ? "" : option.value)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === option.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
