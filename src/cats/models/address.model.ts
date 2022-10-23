import { Id } from 'src/common/valueObjects/id';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Address } from '../entities/address.entity';

@Entity({ name: 'addresses' })
export class AddressModel {
    @PrimaryGeneratedColumn('uuid')
    public id: string;

    @Column('varchar', { length: 255 })
    public city: string;

    @Column('varchar', { length: 255 })
    public street: string;

    @Column('varchar', { length: 30 })
    public home: string;

    toEntity(): Address {
        return new Address(new Id(this.id), this.city, this.street, this.home);
    }

    static fromEntity(entity: Address): AddressModel {
        const model = new AddressModel();
        model.id = String(entity.id);
        model.city = entity.city;
        model.street = entity.street;
        model.home = entity.home;

        return model;
    }
}
