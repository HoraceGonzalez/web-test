import {
  Column,
  Length,
  Index,
  CreatedAt,
  Model,
  PrimaryKey, Table,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'

import { Inventory } from './Inventory';

@Table({ tableName: 'reservations' })
export class Reservation extends Model<Reservation> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column
  @ForeignKey(() => Inventory)
  inventory_id: number

  @BelongsTo(() => Inventory)
  inventory: Inventory

  @Length({ max: 255 })
  @Column
  name: string

  @Length({ max: 255 })
  @Column
  @Index // assuming this is a unique index
  email: string

  @Column
  @Index // this should be some kind of range index.
  party_size: number

  @Column
  @Index
  reserved_at: Date

  @Column
  cancelled_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
};