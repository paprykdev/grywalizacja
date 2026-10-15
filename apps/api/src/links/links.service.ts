import { Injectable, NotFoundException } from '@nestjs/common';

import { CreateLinkDto, UpdateLinkDto } from '@repo/api';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LinksService {
  constructor(private readonly prisma: PrismaService) {}

  create(createLinkDto: CreateLinkDto) {
    return this.prisma.link.create({ data: createLinkDto });
  }

  findAll() {
    return this.prisma.link.findMany({ orderBy: { id: 'asc' } });
  }

  async findOne(id: number) {
    const link = await this.prisma.link.findUnique({ where: { id } });
    if (!link) {
      throw new NotFoundException(`Link #${id} not found`);
    }
    return link;
  }

  async update(id: number, updateLinkDto: UpdateLinkDto) {
    await this.findOne(id);
    return this.prisma.link.update({ where: { id }, data: updateLinkDto });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.link.delete({ where: { id } });
  }
}
