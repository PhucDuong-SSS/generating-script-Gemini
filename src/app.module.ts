import { Module } from '@nestjs/common';
import { GeminiModule } from './gemini/gemini.module';
import { ScriptsModule } from './scripts/scripts.module';
import { HealthController } from './health.controller';

@Module({
  imports: [GeminiModule, ScriptsModule],
  controllers: [HealthController],
})
export class AppModule {}
