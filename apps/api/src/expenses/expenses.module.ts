import { Module } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpensesController } from './expenses.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ExpensesController],
  providers: [ExpensesService],
  imports: [AuthModule],
})
export class ExpensesModule {}
