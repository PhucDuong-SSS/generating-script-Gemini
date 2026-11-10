import { Body, Controller, Post } from '@nestjs/common';
import { GenerateScriptDto } from './dto/generate-script.dto';
import { ScriptsService } from './scripts.service';

@Controller('scripts')
export class ScriptsController {
  constructor(private readonly scriptsService: ScriptsService) {}

  @Post('generate')
  generate(@Body() dto: GenerateScriptDto) {
    return this.scriptsService.generate(dto).then((data) => ({ success: true, data }));
  }
}
