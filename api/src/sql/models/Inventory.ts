import {
  Column,
  CreatedAt,
  DeletedAt,
  Model,
  DataType,
  PrimaryKey, Table,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript'

import { Restaurant } from './Restaurant';

@Table({ tableName: 'inventory' })
export class Inventory extends Model<Inventory> {
  @PrimaryKey
  @Column({ autoIncrement: true })
  id: number

  @Column
  @ForeignKey(() => Restaurant)
  restaurant_id: number

  @BelongsTo(() => Restaurant)
  restaurant: Restaurant

  @Column
  party_size: number

  @Column
  available_at: Date
}