import { Module, DynamicModule } from '@nestjs/common';
import { resolve } from 'path';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ApiController } from './controllers/api.controller';
import { TicketController } from './controllers/ticket.controller';
import { PersonaController } from './controllers/persona.controller';
import { ArtifactsController } from './controllers/artifacts.controller';
import { ContributorController } from './controllers/contributor.controller';
import { TotemService } from './services/totem.service';
import { PrefixController } from './controllers/prefix.controller';
import { LayerController } from './controllers/layer.controller';
import { ComponentController } from './controllers/component.controller';
import { FeatureController } from './controllers/feature.controller';
import { PriorityController } from './controllers/priority.controller';
import { StatusController } from './controllers/status.controller';
import { ComplexityController } from './controllers/complexity.controller';

@Module({
  controllers: [ApiController, TicketController, PersonaController, ArtifactsController, ContributorController, LayerController, ComponentController, FeatureController, PriorityController, StatusController, ComplexityController],
  providers: [
    TotemService,
    {
      provide: 'COMPONENT_MARKDOWN_PATH',
      useValue: resolve(process.cwd(), '.totem/projects/conventions/id.md'),
    },
  ],
})
export class AppModule {
  static forRoot(): DynamicModule {
    const isDevelopment = process.env.NODE_ENV !== 'production';
    console.log('🔧 AppModule.forRoot() called');
    console.log('🔧 NODE_ENV:', process.env.NODE_ENV);
    console.log('🔧 isDevelopment:', isDevelopment);
    
    const imports: any[] = [];
    
    // Only serve static files in production
    if (!isDevelopment) {
      const staticPath = join(process.cwd(), 'frontend', 'dist');
      console.log('🔧 Configuring static file serving from:', staticPath);
      imports.push(
        ServeStaticModule.forRoot({
          rootPath: staticPath,
          exclude: ['/api*'],
        })
      );
      console.log('🔧 ServeStaticModule added to imports');
    } else {
      console.log('🔧 Skipping static file serving in development mode');
    }

    return {
      module: AppModule,
      imports,
      controllers: [ApiController, TicketController, PersonaController, ArtifactsController, ContributorController, PrefixController, LayerController, ComponentController, FeatureController, PriorityController, StatusController, ComplexityController],
      providers: [TotemService],
    };
  }
}