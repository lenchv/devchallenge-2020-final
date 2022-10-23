import * as fs from 'fs/promises';
import * as path from 'path';

const getClassName = (fileName: string): string => {
    const nameParts = path.basename(fileName, '.ts').split('-');
    const ts = nameParts[0];
    const name = nameParts
        .slice(1)
        .map((name) => name.charAt(0).toLocaleUpperCase() + name.slice(1))
        .join('');

    return name + ts;
};

export const readMigrations = async () => {
    const migrationFiles = await fs.readdir(path.join(__dirname, 'migrations'));

    return Promise.all(
        migrationFiles.map(async (fileName) => {
            const migration = await import(path.join(__dirname, 'migrations', fileName));

            return migration[getClassName(fileName)];
        }),
    );
};
