import { Injectable, NotFoundException, HttpStatus } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateExpenseDto, ListExpensesQueryDto, UpdateExpenseDto } from './dto';
import { Expense, ExpenseDocument } from './entities/expense.entity';
import { APIResponse, formatToApiResponse } from '../apiResponse';

@Injectable()
export class ExpensesService {
  constructor(@InjectModel(Expense.name) private readonly expenseModel: Model<Expense>) {}

  async findAll(
    query: ListExpensesQueryDto,
    userId: Types.ObjectId,
  ): Promise<APIResponse<ExpenseDocument[]>> {
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

    return formatToApiResponse({ data: expenses, total: expenses.length });
  }

  async findOne(id: Types.ObjectId, userId: Types.ObjectId): Promise<APIResponse<ExpenseDocument>> {
    const expense = await this.expenseModel.findOne({ _id: id, userId, deletedAt: null });

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return formatToApiResponse({ data: expense });
  }

  async create(
    createExpenseDto: CreateExpenseDto,
    userId: Types.ObjectId,
  ): Promise<APIResponse<ExpenseDocument>> {
    const expense = await this.expenseModel.create({
      ...createExpenseDto,
      date: this.toUtcMidnight(createExpenseDto.date),
      userId,
    });

    return formatToApiResponse({ data: expense, status: HttpStatus.CREATED });
  }

  async update(
    id: Types.ObjectId,
    updateExpenseDto: UpdateExpenseDto,
    userId: Types.ObjectId,
  ): Promise<APIResponse<ExpenseDocument>> {
    const { date, ...rest } = updateExpenseDto;

    const expense = await this.expenseModel.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { ...rest, ...(date && { date: this.toUtcMidnight(date) }) },
      { new: true },
    );

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return formatToApiResponse({ data: expense });
  }

  async remove(id: Types.ObjectId, userId: Types.ObjectId): Promise<APIResponse<ExpenseDocument>> {
    const expense = await this.expenseModel.findOneAndUpdate(
      { _id: id, userId, deletedAt: null },
      { deletedAt: new Date() },
      { new: true },
    );

    if (!expense) {
      throw new NotFoundException('Expense not found');
    }

    return formatToApiResponse({ data: expense });
  }

  // 'YYYY-MM-DD' → UTC 00:00 of that day
  private toUtcMidnight(date: string): Date {
    return new Date(`${date}T00:00:00.000Z`);
  }
}
