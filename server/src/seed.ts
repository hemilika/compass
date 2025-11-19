import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SeederService } from './database/seeder.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seeder = app.get(SeederService);

    try {
        await seeder.seed();
        console.log('✅ Seeding completed successfully');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        throw error;
    } finally {
        await app.close();
    }
}

bootstrap();
