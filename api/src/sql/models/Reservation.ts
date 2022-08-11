import {
  Column,
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

  @Column
  name: string

  @Column
  email: string

  @Column
  party_size: number

  @Column
  reserved_at: Date

  @Column
  cancelled_at: string

  @CreatedAt
  created_at: string

  @UpdatedAt
  updated_at: string
};