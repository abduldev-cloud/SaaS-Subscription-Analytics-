import PDFDocument from "pdfkit";
import fs from "node:fs";
import path from "node:path";

interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  plan: string;
  amount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  paidAt: Date;
}

export function generateInvoicePdf(data: InvoiceData): Promise<string> {
  return new Promise((resolve, reject) => {
    const invoiceDirectory = path.resolve("storage/invoices");

    fs.mkdirSync(invoiceDirectory, { recursive: true });

    const fileName = `${data.invoiceNumber}.pdf`;
    const filePath = path.join(invoiceDirectory, fileName);

    const doc = new PDFDocument();
    const stream = fs.createWriteStream(filePath);

    doc.pipe(stream);

    doc.fontSize(24).text("SaaS Platform", { align: "center" });

    doc.moveDown();
    doc.fontSize(18).text("INVOICE", { align: "center" });

    doc.moveDown(2);

    doc.fontSize(12).text(`Invoice Number: ${data.invoiceNumber}`);
    doc.text(`Customer: ${data.customerName}`);
    doc.text(`Email: ${data.customerEmail}`);

    doc.moveDown();

    doc.text(`Plan: ${data.plan}`);
    doc.text(
      `Amount: ${(data.amount / 100).toFixed(2)} ${data.currency.toUpperCase()}`
    );
    doc.text(`Payment Status: PAID`);

    doc.moveDown();

    doc.text(
      `Billing Period: ${data.startDate.toLocaleDateString()} - ${data.endDate.toLocaleDateString()}`
    );

    doc.text(`Paid At: ${data.paidAt.toLocaleString()}`);

    doc.moveDown(2);

    doc.text("Thank you for your subscription.");

    doc.end();

    stream.on("finish", () => {
      resolve(`storage/invoices/${fileName}`);
    });

    stream.on("error", reject);
  });
}