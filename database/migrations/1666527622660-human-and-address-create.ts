import { MigrationInterface, QueryRunner, Table, TableColumn, TableForeignKey } from 'typeorm';

export class HumanAndAddressCreate1666527622660 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'addresses',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'city',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'street',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'home',
                        type: 'varchar',
                        length: '30',
                    },
                ],
            }),
            true,
        );
        await queryRunner.createTable(
            new Table({
                name: 'humans',
                columns: [
                    {
                        name: 'id',
                        type: 'varchar',
                        length: '36',
                        isPrimary: true,
                    },
                    {
                        name: 'name',
                        type: 'varchar',
                        length: '255',
                    },
                    {
                        name: 'address_id',
                        type: 'varchar',
                        length: '255',
                        isNullable: true,
                    },
                ],
                foreignKeys: [
                    new TableForeignKey({
                        name: 'humman_to_address',
                        columnNames: ['address_id'],
                        referencedTableName: 'addresses',
                        referencedColumnNames: ['id'],
                    }),
                ],
            }),
            true,
            true,
        );

        await queryRunner.addColumn(
            'cats',
            new TableColumn({
                name: 'human_id',
                type: 'varchar',
                length: '36',
                isNullable: true,
            }),
        );

        await queryRunner.createForeignKey(
            'cats',
            new TableForeignKey({
                name: 'cat_to_human',
                columnNames: ['human_id'],
                referencedTableName: 'humans',
                referencedColumnNames: ['id'],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropForeignKey('humman', 'humman_to_address');
        await queryRunner.dropForeignKey('cats', 'cat_to_human');
        await queryRunner.dropColumn('cats', 'humman_id');
        await queryRunner.dropTable('humans');
        await queryRunner.dropTable('addresses');
    }
}
