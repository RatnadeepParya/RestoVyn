import { Module, NestModule, MiddlewareConsumer } from "@nestjs/common";
import { PrismaModule } from "./core/prisma/prisma.module";
import { EventsModule } from "./core/events/events.module";
import { ProvidersModule } from "./core/providers/providers.module";
import { RequestIdMiddleware } from "./common/middleware/request-id.middleware";

import { AuthModule } from "./modules/auth/auth.module";
import { StaffModule } from "./modules/staff/staff.module";
import { RestaurantModule } from "./modules/restaurant/restaurant.module";
import { FloorsModule } from "./modules/floors/floors.module";
import { TablesModule } from "./modules/tables/tables.module";
import { MenuModule } from "./modules/menu/menu.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { KotModule } from "./modules/kot/kot.module";
import { KitchenModule } from "./modules/kitchen/kitchen.module";
import { BillingModule } from "./modules/billing/billing.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { InventoryModule } from "./modules/inventory/inventory.module";
import { CashierModule } from "./modules/cashier/cashier.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { SyncModule } from "./modules/sync/sync.module";
import { HealthModule } from "./modules/health/health.module";
import { AuditModule } from "./modules/audit/audit.module";

@Module({
  imports: [
    PrismaModule,
    EventsModule,
    ProvidersModule,
    AuthModule,
    StaffModule,
    RestaurantModule,
    FloorsModule,
    TablesModule,
    MenuModule,
    OrdersModule,
    KotModule,
    KitchenModule,
    BillingModule,
    PaymentsModule,
    InventoryModule,
    CashierModule,
    ReportsModule,
    SyncModule,
    HealthModule,
    AuditModule,
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes("*");
  }
}
