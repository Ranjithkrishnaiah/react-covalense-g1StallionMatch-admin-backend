import { ValidationPipe, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { SerializerInterceptor } from './utils/serializer.interceptor';
import validationOptions from './utils/validation-options';
import { config } from 'aws-sdk';
import * as basicAuth from 'express-basic-auth';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import  'winston-daily-rotate-file';
import * as bodyParser from 'body-parser';


async function bootstrap() {
  const SWAGGER_ENVS = ['local', 'development', 'staging'];
  const app = await NestFactory.create(AppModule, {
    cors: true,
    logger: WinstonModule.createLogger({
      transports: [
        // file on daily rotation (error only)
        new transports.DailyRotateFile({
          // %DATE will be replaced by the current date
          filename: `logs/%DATE%-error.log`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false, // don't want to zip our logs
          maxFiles: '30d', // will keep log until they are older than 30 days
        }),
        // same for all levels
        new transports.DailyRotateFile({
          filename: `logs/%DATE%-combined.log`,
          format: format.combine(format.timestamp(), format.json()),
          datePattern: 'YYYY-MM-DD',
          zippedArchive: false,
          maxFiles: '30d',
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
          ),
        }),
      ],
    }),
  });
  const configService = app.get(ConfigService);
  config.update({
    accessKeyId: configService.get('file.accessKeyId'),
    secretAccessKey: configService.get('file.secretAccessKey'),
    region: configService.get('file.awsS3Region'),
  });

  app.enableShutdownHooks();
  app.setGlobalPrefix(configService.get('app.apiPrefix'), {
    exclude: ['/'],
  });
  app.enableVersioning({
    type: VersioningType.URI,
  });
  app.useGlobalInterceptors(new SerializerInterceptor());
  app.useGlobalPipes(new ValidationPipe(validationOptions));
  if (SWAGGER_ENVS.includes(process.env.NODE_ENV)) {
    app.use(
      ['/docs', '/docs-json'],
      basicAuth({
        challenge: true,
        users: {
          [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD,
        },
      }),
    );
    const options = new DocumentBuilder()
      .setTitle('Stallion Match API - SuperUser')
      .setDescription('Stallion Match API docs - SuperUser')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('docs', app, document);
  }
  // Enable body parsing for JSON and URL-encoded bodies
  app.use(bodyParser.json({ limit: '20mb' }));
  app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
  await app.listen(configService.get('app.port'));
}
void bootstrap();
