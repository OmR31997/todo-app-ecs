import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private readonly USERS_CACHE_KEY = 'users:all';

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    const cachedUsers = await this.redis.get<any[]>(this.USERS_CACHE_KEY);
    if (cachedUsers) {
      return cachedUsers;
    }

    const users = await this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
    });

    await this.redis.set(this.USERS_CACHE_KEY, users, 300);
    return users;
  }

  async create(dto: CreateUserDto) {
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
      },
    });

    await this.redis.del(this.USERS_CACHE_KEY);
    return user;
  }

  async remove(id: string) {
    const existing = await this.prisma.user.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.delete({ where: { id } });
    await this.redis.del(this.USERS_CACHE_KEY);
    await this.redis.delByPattern('tasks:*');
  }
}
