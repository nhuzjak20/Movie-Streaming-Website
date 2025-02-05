import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoginControllerController } from './login-controller/login-controller.controller';

@Module({
  imports: [],
  controllers: [AppController, LoginControllerController],
  providers: [AppService],
})
export class AppModule {}
