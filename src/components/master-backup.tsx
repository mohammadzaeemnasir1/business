
"use-client";

import { Button } from "@/components/ui/button";
import { DownloadCloud } from "lucide-react";
import * as XLSX from "xlsx";

type MasterBackupProps = {
  data: Record<string, any[]>;
  fileName: string;
};

export function MasterBackup({ data, fileName }: MasterBackupProps) {
  const exportData = () => {
    const workbook = XLSX.utils.book_new();

    for (const sheetName in data) {
      if (Object.prototype.hasOwnProperty.call(data, sheetName)) {
        const worksheet = XLSX.utils.json_to_sheet(data[sheetName]);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      }
    }

    XLSX.writeFile(workbook, `${fileName}.xlsx`);
  };

  return (
    <Button onClick={exportData} variant="outline">
      <DownloadCloud className="mr-2" />
      Master Backup
    </Button>
  );
}
