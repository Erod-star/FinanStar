import {
  IsDateString,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  Min,
} from 'class-validator';
import { ExpenseCategory, NecessityType } from '../entities/expense.entity';

export class CreateExpenseDto {
  // Date-only, format YYYY-MM-DD
  @IsDateString({ strict: true })
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be in YYYY-MM-DD format' })
  date!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description!: string;

  // Integer cents (1250 = 12.50)
  @IsInt()
  @Min(1)
  amount!: number;

  @IsEnum(NecessityType)
  necessityType!: NecessityType;

  @IsOptional()
  @IsEnum(ExpenseCategory)
  category?: ExpenseCategory;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  source?: string;
}
