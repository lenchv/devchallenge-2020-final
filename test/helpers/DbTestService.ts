import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

export class DbTestService {
    constructor(
        @InjectDataSource()
        private readonly connection: DataSource,
    ) {}

    async runMigrations() {
        await this.connection.runMigrations();
    }

    async dropDatabase() {
        await this.connection.dropDatabase();
    }
}
