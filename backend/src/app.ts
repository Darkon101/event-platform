const express = require('express')
const cors = require('cors')
const usersRouter = require('./routes/users.router')
const { handleCustomErrors, handlePSQLErrors, handleServerErrors } = require('./middleware/error.middleware')


const app = express()
app.use(cors())
app.use(express.json())

app.use('/api/users', usersRouter)

app.use((req: any, res: any) => {
  res.status(404).json({ msg: 'Route not found' });
});

app.use(handleCustomErrors)
app.use(handlePSQLErrors)
app.use(handleServerErrors)


module.exports = app