import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ParseObjectIdPipe } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { ExpensesService } from './expenses.service';
import { CreateExpenseDto, ListExpensesQueryDto, UpdateExpenseDto } from './dto';
import { Auth } from '../auth/decorators/auth.decorator';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserDocument } from '../auth/entities/user.entity';
import { formatToApiResponse } from '../apiResponse';

@Controller('expenses')
@Auth()
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @Get()
  async findAll(@Query() query: ListExpensesQueryDto, @GetUser() user: UserDocument) {
    return await this.expensesService.findAll(query, user._id);
  }

  @Get(':id')
  async findOne(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @GetUser() user: UserDocument) {
    return await this.expensesService.findOne(id, user._id);
  }

  @Post()
  async create(@Body() createExpenseDto: CreateExpenseDto, @GetUser() user: UserDocument) {
    return await this.expensesService.create(createExpenseDto, user._id);
  }

  @Patch(':id')
  async update(
    @Param('id', ParseObjectIdPipe) id: Types.ObjectId,
    @Body() updateExpenseDto: UpdateExpenseDto,
    @GetUser() user: UserDocument,
  ) {
    return await this.expensesService.update(id, updateExpenseDto, user._id);
  }

  @Delete(':id')
  async remove(@Param('id', ParseObjectIdPipe) id: Types.ObjectId, @GetUser() user: UserDocument) {
    const expense = await this.expensesService.remove(id, user._id);
    return formatToApiResponse({ data: expense });
  }
}
