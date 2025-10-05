
"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";

type ExportDataProps<T> = {
  data: T[];
  fileName: string;
  buttonText?: string;
};

export function ExportData<T>({ data, fileName, buttonText = "Export All Details to Excel" }: ExportDataProps<T>) {
  const exportData = () => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <Button onClick={exportData}>
      <Download className="mr-2" />
      {buttonText}
    </Button>
  );
}
