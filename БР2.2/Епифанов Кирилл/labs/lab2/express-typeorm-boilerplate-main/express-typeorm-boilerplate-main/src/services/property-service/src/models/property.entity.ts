import { BaseEntity, Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PropertyFacility } from './property-facility.entity';

@Entity()
export class Property extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ type: 'varchar', length: 200, nullable: false })
    propertyName!: string;

    @Column({ type: 'varchar', length: 200, nullable: false })
    propertyType!: string;

    @Column({ type: 'varchar', length: 200, nullable: false })
    propertyAdress!: string;

    @Column({ type: 'varchar', length: 200, nullable: false })
    propertyDescription!: string;

    @Column({ type: 'float', nullable: false })
    propertyPrice!: number;

    @Column({ type: 'varchar', length: 200, nullable: false })
    propertyStatus!: string;

    @Column({ type: 'float', nullable: false })
    propertyOwnerId!: number;

    @Column({ type: 'float', nullable: false })
    propertyCityId!: number;

    @OneToMany(() => PropertyFacility, (pf) => pf.property, {
        cascade: true,
        eager: true,
    })
    facilities!: PropertyFacility[];
}
