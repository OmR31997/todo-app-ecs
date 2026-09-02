import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private getCacheKey(userId?: string): string {
    return userId ? `tasks:user:${userId}` : 'tasks:all';
  }

  async findAll(userId?: string) {
    const cacheKey = this.getCacheKey(userId);
    const cachedTasks = await this.redis.get<any[]>(cacheKey);
    if (cachedTasks) {
      return cachedTasks;
    }

    const where = userId ? { userId } : {};
    const tasks = await this.prisma.task.findMany({
      where,
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });

    await this.redis.set(cacheKey, tasks, 300);
    return tasks;
  }

  async create(dto: CreateTaskDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: dto.userId },
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${dto.userId} not found`);
    }

    const task = await this.prisma.task.create({
      data: {
        title: dto.title,
        description: dto.description,
        userId: dto.userId,
      },
      include: { user: true },
    });

    await this.redis.delByPattern('tasks:*');
    return task;
  }

  async update(id: string, dto: UpdateTaskDto) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    const updated = await this.prisma.task.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.completed !== undefined && { completed: dto.completed }),
      },
      include: { user: true },
    });

    await this.redis.delByPattern('tasks:*');
    return updated;
  }

  async remove(id: string) {
    const existing = await this.prisma.task.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }

    await this.prisma.task.delete({ where: { id } });
    await this.redis.delByPattern('tasks:*');
  }
}
