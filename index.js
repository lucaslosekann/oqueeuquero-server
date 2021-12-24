const express = require('express');
const app = express();
const port = 8080;
const cors = require('cors');
require('dotenv').config()
require('./src/utils/db.js');

console.log('davi é lindo')

const authRouter = require('./src/resources/auth/auth.router');
const userRouter = require('./src/resources/user/user.router');
const listRouter = require('./src/resources/list/list.router');
const listItemRouter = require('./src/resources/listItem/listItem.router')
const paymentsRouter = require('./src/resources/payments/payments.router')
app.disable('x-powered-by');

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', authRouter);
app.use('/api/user', userRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/list', listRouter);
app.use('/api/listItem', listItemRouter);


app.listen(port, ()=>{
  console.log('Server is listening on port '+port);
});
