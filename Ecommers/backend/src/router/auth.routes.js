import {Router} from 'express'
import singIn from '../controllers/auth.controller.js'
import checkAuth from '../controllers/checkAuth.controller.js'
import insertproduct from '../controllers/insert.controller.js'
import getproductController from '../controllers/getproduct.controller.js'
import cartProduct from '../controllers/cartProduct.controller.js'
import getCartProductdata from '../controllers/getcarProduct.controller.js'
import deleteOrder from '../controllers/deletcart.controller.js'
import BuyProducts from '../controllers/buyProduct.controller.js'
import getBuyProductdata from '../controllers/getBuyProduct.controller.js'
import deleteBuyOrder from '../controllers/deleteOrderProduct.controller.js'
import tookenChecker from '../middleware/Tokens.js'

const authRouter = Router()


authRouter.post('/insert-product', tookenChecker, insertproduct)
authRouter.post('/cartProduct', tookenChecker, cartProduct)
authRouter.post('/singin', singIn)
authRouter.post('/buyorder', tookenChecker, BuyProducts)
authRouter.post('/deleteBuyOrder', tookenChecker, deleteBuyOrder)
authRouter.post('/deleteCart', tookenChecker, deleteOrder)
authRouter.get('/getProduct', getproductController)
authRouter.get('/getCartProduct', tookenChecker, getCartProductdata)
authRouter.get('/checkAuth', tookenChecker, checkAuth)
authRouter.get('/getBuyProductdata', tookenChecker, getBuyProductdata)

export default authRouter
