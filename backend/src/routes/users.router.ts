import express from 'express'
const {getUsers, getUserByUsername, postUser} = require('../controllers/users.controller')

const usersRouter = express.Router()

usersRouter.get('/', getUsers);
usersRouter.get('/:username', getUserByUsername);
usersRouter.post('/', postUser);

module.exports = usersRouter