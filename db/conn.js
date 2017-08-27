const Sequelize = require('sequelize')
const conn = new Sequelize('postgres://localhost:5432/cart_db')

module.exports = conn
