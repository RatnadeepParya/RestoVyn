import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { Logger } from "@nestjs/common";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";
import { TransformResponseInterceptor } from "./common/interceptors/transform-response.interceptor";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
    credentials: true,
  });

  const apiPrefix = process.env.API_PREFIX || "api/v1";
  app.setGlobalPrefix(apiPrefix, {
    exclude: ["health", "health/live", "health/ready"],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(new TransformResponseInterceptor());

  // OpenAPI Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle("RestoVyn Restaurant Operations & POS API")
    .setDescription(
      "Production-grade REST & WebSocket API specification for internal restaurant management, tables, KOT, KDS, billing, inventory, and offline sync.",
    )
    .setVersion("1.0.0")
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  logger.log(
    `🚀 RestoVyn API server running on http://localhost:${port}/${apiPrefix}`,
  );
  logger.log(
    `📖 Swagger API documentation available on http://localhost:${port}/api/docs`,
  );
}

bootstrap();
