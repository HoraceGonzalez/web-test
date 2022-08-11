import { Sequelize } from 'sequelize-typescript';

import * as models from '../sql/models';

export default new Sequelize(process.env.DATABASE_CONNECTION_STRING, {
  dialect: 'postgres',
  logging: process.env.LOG === 'debug' ? console.log : false,
  models: Object.keys(models).map(k => models[k]),
})

export * from './reservations';
export * from './inventory';
export * from './restaurant';
