import { Id } from 'src/common/valueObjects/id';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Cat } from '../entities/cat.entity';

@Entity({ name: 'cats' })
export class CatModel {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public name: string;

    toEntity(): Cat {
        return new Cat(new Id(this.id), this.name);
    }

    static fromEntity(cat: Cat): CatModel {
        const model = new CatModel();
        model.id = String(cat.id);
        model.name = cat.name;

        return model;
    }
}
