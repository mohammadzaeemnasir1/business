"use client";

import * as React from "react";
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  useReactTable,
  getFacetedRowModel,
  getFacetedUniqueValues,
  FilterFn,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRange } from "react-day-picker";
import { addDays, format, parseISO, startOfDay } from "date-fns";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, ChevronDown, ListFilter, ArrowUpDown } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export type Transaction = {
  id: string;
  date: string;
  billNumber: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  payers: string;
};

const payersList = ["Muhammad Faisal", "Mr. Hafiz Abdul Rasheed"];

const dateBetweenFilterFn: FilterFn<any> = (row, columnId, value) => {
    const date = startOfDay(new Date(row.getValue(columnId)));
    const [start, end] = value; // value is an array of two dates
    if (!start || !end) return true;
    return date >= startOfDay(start) && date <= startOfDay(end);
}

export function TransactionHistory({ data }: { data: Transaction[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: addDays(new Date(), -90),
    to: new Date(),
  });

  const columns: ColumnDef<Transaction>[] = [
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => format(parseISO(row.original.date), "dd/MM/yyyy"),
      filterFn: dateBetweenFilterFn,
    },
    {
      accessorKey: "billNumber",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Bill #
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <span className="font-medium">{row.original.billNumber}</span>,
    },
    {
      accessorKey: "payers",
      header: "Paid By",
      cell: ({ row }) => {
        const payers = row.original.payers.split(', ').filter(Boolean);
        if (payers.length === 0) return 'N/A';
        return (
          <div className="flex flex-col">
            {payers.map(p => <span key={p}>{p}</span>)}
          </div>
        )
      },
      filterFn: (row, id, value) => {
        if (!value || value.length === 0) return true;
        const payers = row.original.payers.split(', ').filter(Boolean);
        return payers.some(p => value.includes(p));
      }
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <div className="text-right">
            <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
            Total Amount
            <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
        </div>
      ),
      cell: ({ row }) => <div className="text-right">{formatCurrency(row.original.totalAmount)}</div>,
    },
    {
      accessorKey: "paidAmount",
      header: () => <div className="text-right">Amount Paid</div>,
      cell: ({ row }) => <div className="text-right text-green-600">{formatCurrency(row.original.paidAmount)}</div>,
    },
    {
      accessorKey: "balance",
      header: () => <div className="text-right">Balance</div>,
      cell: ({ row }) => (
        <div className="text-right font-semibold">
          <Badge variant={row.original.balance > 0 ? "destructive" : "secondary"}>
            {formatCurrency(row.original.balance)}
          </Badge>
        </div>
      ),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      sorting,
      columnFilters,
    },
  });
  
  React.useEffect(() => {
    const dateFilter = [date?.from, date?.to];
    table.getColumn("date")?.setFilterValue(dateFilter)
  }, [date, table]);


  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Input
          placeholder="Search by Bill Number..."
          value={(table.getColumn("billNumber")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("billNumber")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <ListFilter className="mr-2 h-4 w-4" />
              Filter
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter by Payer</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {payersList.map((payer) => (
              <DropdownMenuCheckboxItem
                key={payer}
                checked={
                  (table.getColumn("payers")?.getFilterValue() as string[] | undefined)?.includes(payer) ?? false
                }
                onCheckedChange={(checked) => {
                  const currentFilter = (table.getColumn("payers")?.getFilterValue() as string[] | undefined) || [];
                  if(checked) {
                    table.getColumn("payers")?.setFilterValue([...currentFilter, payer]);
                  } else {
                    table.getColumn("payers")?.setFilterValue(currentFilter.filter(p => p !== payer));
                  }
                }}
              >
                {payer}
              </DropdownMenuCheckboxItem>
            ))}
             <DropdownMenuSeparator />
              <DropdownMenuLabel>Filter by Date</DropdownMenuLabel>
              <div className="p-2">
                 <Popover>
                    <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                        "w-[300px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                        date.to ? (
                            <>
                            {format(date.from, "LLL dd, y")} -{" "}
                            {format(date.to, "LLL dd, y")}
                            </>
                        ) : (
                            format(date.from, "LLL dd, y")
                        )
                        ) : (
                        <span>Pick a date</span>
                        )}
                    </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                    />
                    </PopoverContent>
                </Popover>
              </div>

          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="p-2">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="p-2">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
