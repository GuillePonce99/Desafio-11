import express from "express"
import mongoose from "mongoose"
import handlebars from "express-handlebars"
import { __dirname } from "./utils.js"
import { Server } from "socket.io"
import socket from "./socket.js"
import passport from "passport"
import initializePassport from "./config/passport.config.js"
import cookieParser from "cookie-parser"
import Config from "./config/config.js"
//import compression from "express-compression"
import errorHandler from "./middlewares/errors/index.js"
import { addLoger, logger } from "./config/logger.js"


import CartsRouter from "./routes/carts.router.js"
import ProductsRouter from "./routes/products.router.js"
import ViewsRouter from "./routes/views.router.js"
import SessionRouter from "./routes/sessions.router.js"
import TicketsRouter from "./routes/tickets.router.js"
import { mockingProduct } from "./controllers/product.controller.js"

const app = express()

const environment = async () => {
    await mongoose.connect(`mongodb+srv://${Config.MONGO_USER}:${Config.MONGO_PASSWORD}@coder.amwd2xp.mongodb.net/${Config.MONGO_DB}`)
        .then(() => {
            logger.info("DB IS CONNECTED");
            logger.info(`ENTORNO: ${Config.ENVIRONMENT}`);
        })
        .catch((error) => {
            console.log(error);
            process.exit(4)
        })
}




//CONFIG
app.use(express.static("public"))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser())
initializePassport()
app.use(passport.initialize())
app.use(addLoger)

//HANDLEBARS

app.engine("handlebars", handlebars.engine())
app.set("views", __dirname + "/views")
app.set("view engine", "handlebars")

//ENDPOINTS

const routerCarts = new CartsRouter()
app.use("/api/carts", routerCarts.getRouter())

const routerProducts = new ProductsRouter()
app.use("/api/products", routerProducts.getRouter())

const routerViews = new ViewsRouter()
app.use("/", routerViews.getRouter())

const routerSessions = new SessionRouter()
app.use("/api/sessions", routerSessions.getRouter())

const routerTickets = new TicketsRouter()
app.use("/api/tickets", routerTickets.getRouter())

// MANEJO DE ERRORES
app.use(errorHandler)

//MOCKING
app.get("/mockingproducts", mockingProduct)

//EJEMPLO LOGGER
app.get("/loggerTest", (req, res) => {
    req.logger.fatal("CRITICAL!!")
    req.logger.error("ERROR!!")
    req.logger.warning("Alerta!!")
    req.logger.info("INFO!")
    req.logger.debug("DEBUG")
    res.send({ message: "Prueba de logger" })
})

//RENDER PARA TODAS LAS PAGINAS QUE NO EXISTAN
app.use("*", (req, res) => {
    res.render("404", { style: "error.css" })
})


//EVENTOS EN CASO DE QUE UN PROCESO FINALIZE CON UN proccess.exit, Y OTRO EVENTO PARA ATRAPAR ERRORES INESPERADO

process.on("exit", code => {
    logger.info(`Proceso finalizado con codigo: ${code}`)
})

process.on("uncaughtExeption", exception => {
    logger.error(`ERROR INESPERADO: ${exception}`);
})

//SOCKET IO

const httpServer = app.listen(Config.PORT, () => {
    logger.info(`Servidor corriendo en puerto ${Config.PORT}`);
})

const io = new Server(httpServer)
socket(io)

// CORRIENDO DB
environment()

