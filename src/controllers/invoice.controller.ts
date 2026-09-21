import type { Request, Response } from "express";
import fs from "node:fs";
import path from "node:path";

export function getInvoice(req: Request, res: Response) {
  const { invoiceNumber } = req.params;

  const filePath = path.resolve(
    "storage/invoices",
    `${invoiceNumber}.pdf`,
  );

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({
      message: "Invoice not found",
    });
  }

  return res.sendFile(filePath);
}