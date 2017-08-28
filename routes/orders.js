const db = require('../db/index')
const { Order } = db.models
const app = require('express').Router();

module.exports = app;

app.get('/', (req, res, next)=> {
  db.viewModel()
    .then( ([products, lineItems, orders, activeOrder])=> {
      res.locals = { orders, products, lineItems, activeOrder}
      res.render('index')
    })
    .catch(next);
})

app.put('/:id', (req, res, next)=> {
  Order.updateFromRequestBody(req.body, req.params.id)
    .then( () => res.redirect('/'))
    .catch(ex => {
      if(ex.message === 'address required'){
        db.viewModel()
          .then( ([products, lineItems, orders, activeOrder])=> {
            res.locals = { orders, products, lineItems, activeOrder, ex}
            res.render('index')
          })
          .catch(next);
      }
    });
});

app.post('/:id/lineItems', (req, res, next)=> {
  Order.addProductToCart(req.params.id)
    .then( ()=> res.redirect('/'))
    .catch(next);
});

app.delete('/:orderId/lineItems/:id', (req, res, next)=> {
  Order.destroyLineItem(req.params.orderId, req.params.id)
    .then( ()=> res.redirect('/'))
    .catch(next);
});
