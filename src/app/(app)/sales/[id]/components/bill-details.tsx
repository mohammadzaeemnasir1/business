"use client";

import { useState, useEffect } from "react";
import type { Customer, Sale } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Download, Loader2 } from "lucide-react";
import { QRCodeSVG } from 'qrcode.react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

type DetailedItem = {
    name: string;
    category: string;
    size: string;
    color: string;
    price: number;
    quantity: number;
}

type BillDetailsProps = {
  sale: Sale;
  customer: Customer;
  items: DetailedItem[];
};

export function BillDetails({ sale, customer, items }: BillDetailsProps) {
  const [saleUrl, setSaleUrl] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    // This code runs only on the client, after the component has mounted.
    setSaleUrl(window.location.href);
  }, []);
  
  const handleDownload = async () => {
    const billElement = document.getElementById('bill-content');
    if (!billElement) return;

    setIsDownloading(true);

    // Temporarily remove print-only styles to capture full content
    const printStyles = document.createElement('style');
    printStyles.innerHTML = `
      @media print {
        .no-print { display: block !important; }
        .print-container { padding: 1rem !important; }
      }
    `;
    document.head.appendChild(printStyles);
    
    // Hide the download button itself before taking the screenshot
    const downloadButton = document.getElementById('download-button');
    if(downloadButton) downloadButton.style.display = 'none';

    const canvas = await html2canvas(billElement, {
      scale: 2, // Higher scale for better quality
      useCORS: true,
       onclone: (document) => {
        // On clone, we can ensure our QR code is rendered if it wasn't
         const qrCodeNode = document.getElementById('qr-code-placeholder');
         if(qrCodeNode && qrCodeNode.firstChild) {
            // it's already there
         }
      }
    });

    // Show the button again
    if(downloadButton) downloadButton.style.display = 'flex';
    document.head.removeChild(printStyles);

    const imgData = canvas.toDataURL('image/png');
    
    // A4 dimensions in mm: 210 x 297
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;
    
    let imgWidth = pdfWidth - 20; // with margin
    let imgHeight = imgWidth / ratio;

    // If image height is greater than pdf height, scale it down
    if (imgHeight > pdfHeight - 20) {
        imgHeight = pdfHeight - 20;
        imgWidth = imgHeight * ratio;
    }

    const x = (pdfWidth - imgWidth) / 2;
    const y = 10; // top margin

    pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
    pdf.save(`bill-${sale.id}.pdf`);
    setIsDownloading(false);
  };

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const balanceDue = subtotal - sale.amountPaid;

  // Fix for hydration error by correctly parsing the date as UTC
  const [year, month, day] = sale.date.split('-').map(Number);
  const saleDate = new Date(Date.UTC(year, month - 1, day));

  return (
    <>
    <div className="flex justify-end mb-4 no-print">
        <Button onClick={handleDownload} variant="outline" id="download-button" disabled={isDownloading}>
            {isDownloading ? (
                <>
                    <Loader2 className="mr-2 animate-spin"/>
                    Downloading...
                </>
            ) : (
                <>
                    <Download className="mr-2"/>
                    Download Bill
                </>
            )}
        </Button>
    </div>
    <div id="bill-content">
      <Card className="bill-card rounded-none sm:rounded-lg border-0 sm:border">
        <CardHeader className="bg-muted/50 print:bg-transparent">
          <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="font-headline text-2xl font-bold text-primary shop-name">Fancy Pearls</h1>
              <div id="qr-code-placeholder">
                {saleUrl && <QRCodeSVG value={saleUrl} size={80} />}
              </div>
          </div>
          <div className="border-t pt-4 mt-4 flex justify-between text-sm">
              <div>
                  <p className="font-semibold">Bill to:</p>
                  <p>{customer.name}</p>
              </div>
              <div className="text-right">
                  <p><span className="font-semibold">Bill Number:</span> {sale.id}</p>
                  <p><span className="font-semibold">Date:</span> {format(saleDate, "dd MMM, yyyy")}</p>
              </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Item</TableHead>
                <TableHead className="text-center">Quantity</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item, index) => (
                <TableRow key={index}>
                  <TableCell>
                      <p className="font-medium">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{item.category} / {item.size} / {item.color}</p>
                  </TableCell>
                  <TableCell className="text-center">{item.quantity}</TableCell>
                  <TableCell className="text-right">{formatCurrency(item.price)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="bg-muted/50 p-6 print:bg-transparent">
          <div className="w-full space-y-4">
              <div className="flex justify-end gap-4">
                  <div className="w-full sm:w-1/2 md:w-1/3 space-y-2">
                       <div className="flex justify-between">
                          <span>Subtotal:</span>
                          <span>{formatCurrency(subtotal)}</span>
                      </div>
                       <div className="flex justify-between font-semibold text-green-600">
                          <span>Paid:</span>
                          <span>{formatCurrency(sale.amountPaid)}</span>
                      </div>
                       <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2 text-destructive">
                          <span>Balance Due:</span>
                          <span>{formatCurrency(balanceDue)}</span>
                      </div>
                  </div>
              </div>
              <div className="text-center text-sm text-muted-foreground pt-4 border-t thank-you">
                  Thank you for your business!
              </div>
          </div>
        </CardFooter>
      </Card>
    </div>
    </>
  );
}
