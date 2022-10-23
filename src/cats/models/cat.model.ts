import { Id } from 'src/common/valueObjects/id';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Cat } from '../entities/cat.entity';
import { HumanModel } from './human.model';

@Entity({ name: 'cats' })
export class CatModel {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column()
    public name: string;

    @Column('uuid')
    public human_id?: string;

    @OneToOne((type) => HumanModel)
    @JoinColumn({ name: 'human_id' })
    public owner: HumanModel;

    toEntity(): Cat {
        return new Cat(new Id(this.id), this.name, this.owner?.toEntity());
    }

    static fromEntity(cat: Cat): CatModel {
        const model = new CatModel();
        model.id = String(cat.id);
        model.name = cat.name;
        model.human_id = cat.owner?.id ? String(cat.owner?.id) : null;

        return model;
    }
}
