require('source-map-support/register')
import { RouterServer } from './RouterServer'
import sequelize from './sql';

;(async () => {
  new RouterServer().start(8080)

  await sequelize.sync({
    alter: true
  })

})()
