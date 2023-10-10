export default class CartReposity {
    constructor(dao) {
        this.dao = dao
    }
    getCarts = async (req, res) => {
        return await this.dao.getCarts(res)
    }
    getCartById = async (req, res) => {
        const { cid } = req.params
        return await this.dao.getCartById(cid, res)
    }
    addCart = async (req, res) => {
        const token = req.cookies["coderCookieToken"];
        return await this.dao.addCart(token, res)
    }
    addProductToCart = async (req, res) => {
        const { cid, pid } = req.params
        return await this.dao.addProductToCart(cid, pid, res)
    }
    deleteCart = async (req, res) => {
        const { cid } = req.params
        return await this.dao.deleteCart(cid, res)
    }
    deleteAllProductsFromCart = async (req, res) => {
        const { cid } = req.params
        return await this.dao.deleteAllProductsFromCart(cid, res)
    }
    deleteProductsFromCart = async (req, res) => {
        const { cid, pid } = req.params
        return await this.dao.deleteProductsFromCart(cid, pid, res)
    }
    updateQuantity = async (req, res) => {
        const { cid, pid } = req.params
        const { quantity } = req.body
        return await this.dao.updateQuantity(cid, pid, quantity, res)
    }
    getCartByIdView = async (req, res) => {
        const { cid } = req.params
        return await this.dao.getCartByIdView(cid, res)
    }
    getUserCart = async (req, res) => {
        const token = req.cookies["coderCookieToken"];
        return await this.dao.getUserCart(token, res)
    }
} 