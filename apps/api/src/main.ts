import "./instrument";

import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import compression from "compression";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableShutdownHooks();
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3001;
  const config = new DocumentBuilder()
    .setTitle("NIddle")
    .setDescription("NIddle API description")
    .addServer("/", "Default")
    .addBearerAuth(
      { type: "http", scheme: "bearer", bearerFormat: "JWT" },
      "access-token",
    )
    .build();

  app.setGlobalPrefix("api");

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, documentFactory, { useGlobalPrefix: true });

  await app.listen(port);
}
bootstrap().catch((err) => {
  console.error("Fatal error during bootstrap:", err);
  process.exit(1);
});
