const conn = require('./conn')
const Sequelize = conn.Sequelize

const Order = conn.define('order', {
  address: Sequelize.STRING,
  isCart: Sequelize.BOOLEAN
});

const LineItem = conn.define('lineitem', {
  quantity: {
    type : Sequelize.INTEGER,
    defaultValue : 1
  }
});

const Product = conn.define('product', {
  name : Sequelize.STRING
});

const viewModel = function() {
  return Promise.all([
    Product.findAll(),
    LineItem.findAll({
      include : [ { model : Order, required : true, where : { isCart : true } },
                  { model : Product}],
      order:  [['createdAt', 'ASC']]
    }),
    Order.findAll({
      where : { isCart : false},
      include : [ { model : LineItem, required : true,
                include : [ { model : Product}]}]
    }),
    Order.findOne({
      where : { isCart : true}
    }),
  ])
}

Order.addProductToCart = function(productId) {
  return Order.findOne({
    where : { isCart : true }
  })
  .then((order)=> { //If no order in cart
    if(!order) {
      return Order.create({isCart : true})
        .then((order)=> {
          return LineItem.create({productId : productId, orderId : order.id})
        })
    }
    else { //If existing order
      return LineItem.findOne({ where : { orderId : order.id, productId : productId}})
        .then(line=> {
          if(line) {
            line.quantity++
            return line.save()
          }
          else {
            return LineItem.create({productId : productId, orderId : order.id})
          }
        })
    }
  })
}

Order.updateFromRequestBody = function(body, orderId) {
  if (!body.address) {
    return new Promise((resolve,reject)=> {
      reject({message : 'address required'})
    })
  }
  return Order.update({
    isCart : false,
    address : body.address
  }, {
    where : { id : orderId}
  })
}

Order.destroyLineItem = function(orderId, lineId) {
  return LineItem.destroy({
    where : { id : lineId}
  })
  .then (()=> {
    return LineItem.findAll({ where : { orderId : orderId}})
  })
  .then((lines)=> {
    if (!lines.length) {
      return Order.destroy({ where : { id : orderId}})
    }
  })
}

LineItem.belongsTo(Product)
LineItem.belongsTo(Order)
Order.hasMany(LineItem)

const sync = ()=> {
  return conn.sync({force : true})
}

const seed = ()=> {
  return Promise.all([
    Product.create({ name : "bubble tea"}),
    Product.create({ name : "foo protein bar"}),
    Product.create({ name : "buzz lightyear"}),
    Order.create({isCart : true})
  ])
  .then(([p1,p2,p3,o1])=> {
    return LineItem.create({orderId : o1.id, productId : p1.id})
  })

}

module.exports = {
  sync,
  seed,
  viewModel,
  models : {
    Order,
    LineItem,
    Product
  }
}
