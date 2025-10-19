import express from 'express'
import { authenticate, requireAdmin } from '../middleware/auth';
const {getUsers, getUserByUsername, patchUser, removeUser} = require('../controllers/users.controller')

const usersRouter = express.Router()

usersRouter.get("/users", authenticate, requireAdmin, getUsers);
usersRouter.get("/users/:username", getUserByUsername);
usersRouter.patch("/users/:username", authenticate, patchUser);
usersRouter.delete("/users/:username", authenticate, removeUser);

module.exports = usersRouter