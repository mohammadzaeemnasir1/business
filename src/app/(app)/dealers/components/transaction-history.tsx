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
  getExpandedRowModel,
  ExpandedState,
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
import { CalendarIcon, ChevronDown, ListFilter, ArrowUpDown, ChevronRight } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { formatCurrency, cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/lib/types";

export type Transaction = {
  id: string;
  date: string;
  billNumber: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  payers: string;
  items: InventoryItem[];
};


const dateBetweenFilterFn: FilterFn<any> = (row, columnId, value) => {
    const date = startOfDay(new Date(row.getValue(columnId)));
    const [start, end] = value; // value is an array of two dates
    if (!start || !end) return true;
    return date >= startOfDay(start) && date <= startOfDay(end);
}

export function TransactionHistory({ data }: { data: Transaction[] }) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
  const [expanded, setExpanded] = React.useState<ExpandedState>({})
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    const today = new Date();
    return {
      from: startOfDay(addDays(today, -90)),
      to: startOfDay(today),
    };
  });

  const payersList = React.useMemo(() => {
    const payers = new Set<string>();
    data.forEach(t => t.payers.split(', ').filter(Boolean).forEach(p => payers.add(p)));
    return Array.from(payers);
  }, [data]);


  const columns: ColumnDef<Transaction>[] = [
     {
      id: 'expander',
      header: () => null,
      cell: ({ row }) => {
        return row.getCanExpand() ? (
          <button
            {...{
              onClick: row.getToggleExpandedHandler(),
              style: { cursor: 'pointer' },
            }}
          >
            {row.getIsExpanded() ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
          </button>
        ) : null
      },
    },
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
    state: {
      sorting,
      columnFilters,
      expanded,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onExpandedChange: setExpanded,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });
  
  React.useEffect(() => {
    const dateFilter = date ? [startOfDay(date.from as Date), startOfDay(date.to as Date)] : [undefined, undefined];
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
                <React.Fragment key={row.id}>
                <TableRow
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
                {row.getIsExpanded() && (
                    <TableRow>
                        <TableCell colSpan={columns.length} className="p-0">
                           <div className="p-4 bg-muted/50">
                             <h4 className="font-semibold mb-2">Bill Items</h4>
                             <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Item Name</TableHead>
                                        <TableHead className="text-center">Quantity</TableHead>
                                        <TableHead className="text-right">Price/Piece</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {row.original.items.map(item => (
                                        <TableRow key={item.id}>
                                            <TableCell>{item.name}</TableCell>
                                            <TableCell className="text-center">{item.quantity}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(item.pricePerPiece)}</TableCell>
                                            <TableCell className="text-right font-medium">{formatCurrency(item.pricePerPiece * item.quantity)}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                             </Table>
                           </div>
                        </TableCell>
                    </TableRow>
                )}
                </React.Fragment>
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
