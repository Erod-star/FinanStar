import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateExpenseDto, ListExpensesQueryDto, UpdateExpenseDto } from './dto';
import { Expense, ExpenseDocument } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private readonly expenseModel: Model<Expense>) {}

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: Types.ObjectId,
  ): Promise<ExpenseDocument> {
    return this.expenseModel.create({
      ...createExpenseDto,
      date: this.toUtcMidnight(createExpenseDto.date),
      userId,
    });
  }

  async findAll(
    query: ListExpensesQueryDto,
    userId: Types.ObjectId,
  ): Promise<{ expenses: ExpenseDocument[]; total: number }> {
    const now = new Date();
    const year = query.year ?? now.getUTCFullYear();
    const month = query.month ?? now.getUTCMonth() + 1;

    const expenses = await this.expenseModel
      .find({
        userId,
        deletedAt: null,
        date: {
          $gte: new Date(Date.UTC(year, month - 1, 1)),
          $lt: new Date(Date.UTC(year, month, 1)),
        },
      })
      .sort({ date: -1, createdAt: -1 });

    return { expenses, total: expenses.length };
  }

  findOne(id: number) {
    return `This action returns a #${id} expense`;
  }

  update(id: number, updateExpenseDto: UpdateExpenseDto) {
    console.log('🚀 => ~ updateExpenseDto:', updateExpenseDto);
    return `This action updates a #${id} expense`;
  }

  remove(id: number) {
    return `This action removes a #${id} expense`;
  }

  // 'YYYY-MM-DD' → UTC 00:00 of that day
  private toUtcMidnight(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }
}
