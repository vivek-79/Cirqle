import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@repo/db'


@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit,OnModuleDestroy {
    async onModuleInit() {
        this.$connect()
        console.log("Prisma connected")
    }

    async onModuleDestroy() {
        this.$disconnect()
        console.log("Prisma disconnected")
    }
}