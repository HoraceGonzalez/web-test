import * as models from '../models'
import { Sequelize } from 'sequelize-typescript'

export default new Sequelize(process.env.DATABASE_CONNECTION_STRING, {
  dialect: 'postgres',
  logging: process.env.LOG === 'debug' ? console.log : false,
  models: Object.keys(models).map(k => models[k]),
})
