import { Router } from "express";
import controller from '../controller/index.js';

const userRoute = Router();

userRoute.post('/register', controller.userController.registerController)

export default userRoute;