import { Global, Module } from "@nestjs/common";
import { LocalStorageProvider } from "./storage.provider";
import { ManualPaymentProvider } from "./payment.provider";
import { SmtpNotificationProvider } from "./notification.provider";
import { EscPosPrinterProvider } from "./printer.provider";

@Global()
@Module({
  providers: [
    {
      provide: "STORAGE_PROVIDER",
      useClass: LocalStorageProvider,
    },
    {
      provide: "PAYMENT_PROVIDER",
      useClass: ManualPaymentProvider,
    },
    {
      provide: "NOTIFICATION_PROVIDER",
      useClass: SmtpNotificationProvider,
    },
    {
      provide: "PRINTER_PROVIDER",
      useClass: EscPosPrinterProvider,
    },
  ],
  exports: [
    "STORAGE_PROVIDER",
    "PAYMENT_PROVIDER",
    "NOTIFICATION_PROVIDER",
    "PRINTER_PROVIDER",
  ],
})
export class ProvidersModule {}
