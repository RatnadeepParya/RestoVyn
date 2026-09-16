import { Injectable, Logger } from "@nestjs/common";
import {
  PrinterProvider,
  PrinterReceiptData,
  PrinterKOTData,
} from "@restovyn/types";

@Injectable()
export class EscPosPrinterProvider implements PrinterProvider {
  private readonly logger = new Logger(EscPosPrinterProvider.name);

  async printReceipt(
    receipt: PrinterReceiptData,
    printerUri: string,
  ): Promise<void> {
    this.logger.log(
      `[ESC/POS Print Receipt] Printer: ${printerUri} - Invoice: ${receipt.invoiceNumber} - Grand Total: ${receipt.grandTotal}`,
    );
  }

  async printKOT(kot: PrinterKOTData, printerUri: string): Promise<void> {
    this.logger.log(
      `[ESC/POS Print KOT] Printer: ${printerUri} - KOT: ${kot.kotNumber} - Table: ${kot.tableNumber} - Station: ${kot.stationName}`,
    );
  }

  async openCashDrawer(printerUri: string): Promise<void> {
    this.logger.log(`[ESC/POS Kick Cash Drawer] Printer: ${printerUri}`);
  }
}
