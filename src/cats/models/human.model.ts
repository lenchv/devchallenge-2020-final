import { Id } from 'src/common/valueObjects/id';
import { Column, Entity, PrimaryGeneratedColumn, OneToOne, JoinColumn } from 'typeorm';
import { Address } from '../entities/address.entity';
import { Human } from '../entities/human.entity';
import { AddressModel } from './address.model';

@Entity({ name: 'humans' })
export class HumanModel {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column('varchar', { length: 255 })
    public name: string;

    @Column('uuid')
    public address_id: string;

    @OneToOne((type) => AddressModel)
    @JoinColumn({ name: 'address_id' })
    address: AddressModel;

    toEntity(): Human {
        return new Human(new Id(this.id), this.name, this.address?.toEntity());
    }

    static fromEntity(human: Human): HumanModel {
        const model = new HumanModel();
        model.id = String(human.id);
        model.name = human.name;
        model.address_id = human.address?.id ? String(human.address?.id) : null;

        return model;
    }
}
