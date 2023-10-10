import Routes from "./router.js"
import { getProducts, getProductById, addProduct, deleteProduct, updateProduct } from "../controllers/product.controller.js"

export default class ProductsRouter extends Routes {
    init() {
        this.get("/", ["ADMIN", "USER", "USER_PREMIUM"], getProducts)

        this.get("/:pid", ["ADMIN", "USER", "USER_PREMIUM"], getProductById)

        this.post("/", ["PUBLIC"], addProduct)

        this.delete("/:pid", ["PUBLIC"], deleteProduct)

        this.put("/:pid", ["ADMIN"], updateProduct)

    }
}

