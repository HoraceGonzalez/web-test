import {
  Column,
  Index,
  Model,
  PrimaryKey, Table,
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
  @Index
  @ForeignKey(() => Restaurant)
  restaurant_id: number

  @BelongsTo(() => Restaurant)
  restaurant: Restaurant

  @Column
  @Index
  party_size: number

  @Column
  @Index
  available_at: Date
}