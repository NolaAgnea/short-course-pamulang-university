import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('Day 4 Backend API | Kandhi Nala Dri Asmara | 221011401576')
    .setDescription(
      'SimpleStorage dApp Backend with NestJS & Viem on Avalanche Fuji Testnet',
    )
    .setVersion('1.0')
    .addTag('Blockchain')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('documentation', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}

bootstrap().catch((error) => {
  console.error('Error during application bootstrap:', error);
  process.exit(1);
});
