import ProductModel from "../models/products.model.js";
import CustomError from "../../../services/errors/CustomError.js";
import EErrors from "../../../services/errors/enums.js";
import { generateProductErrorInfo } from "../../../services/errors/info.js";

export default class Products {
    constructor() { }
    getProductById = async (pid, res) => {

        try {
            const product = await ProductModel.findOne({ code: pid })
            if (!product) {
                return res.status(404).json({ message: "Not Found" });
            }
            const result = await ProductModel.findOne({ code: pid });
            res.status(200).json({ message: "success", result })
        }
        catch (error) {
            res.status(500).send(error)
        }

    }
    addProduct = async (product, res) => {

        const { id, title, description, code, price, stock, status, category, thumbnails } = product

        if (!title || !description || !code || !price || !category) {
            CustomError.createError({
                name: "Error al agregar el producto",
                cause: generateProductErrorInfo(product),
                message: "Faltan datos!",
                code: EErrors.INVALID_TYPES_ERROR
            })

        }

        if (id) {
            return res.status(401).json({ message: "No incluir ID" });
        }

        const repetedCode = await ProductModel.findOne({ "code": code })

        if (repetedCode) {
            CustomError.createError({
                name: "Error al agregar el producto",
                cause: generateProductErrorInfo(product),
                message: `Ya existe el producto con el CODE: ${code}`,
                code: EErrors.INVALID_TYPES_ERROR
            })
            //return res.status(404).json({ message: `Ya existe el producto con el CODE: ${code}` });
        }

        try {

            const product = {
                title,
                description,
                code,
                price,
                status,
                stock,
                category,
                thumbnails
            }

            const result = await ProductModel.create(product)

            res.status(200).json({ message: "success", result })
        }
        catch (error) {
            //console.log("1- ", error);
        }
    }
    deleteProduct = async (pid, res) => {

        try {
            const product = await ProductModel.findOne({ code: pid })

            if (!product) {
                CustomError.createError({
                    name: "Error al eliminar el producto",
                    cause: generateProductErrorInfo(product),
                    message: "Not Found",
                    code: EErrors.DATABASE_ERROR
                })
                //return res.status(404).json({ message: "Not Found" });
            }

            const result = await ProductModel.findOneAndDelete({ code: pid })

            res.status(200).json({ message: "success", result })
        }
        catch (error) {
            res.status(500).send(error)
        }
    }
    updateProduct = async (pid, body, res) => {


        try {
            const product = await ProductModel.findOne({ _id: pid })

            if (!product) {
                CustomError.createError({
                    name: "Error al actualizar el producto",
                    cause: generateProductErrorInfo(product),
                    message: "Not Found",
                    code: EErrors.DATABASE_ERROR
                })
                //return res.status(404).json({ message: "Not Found" });
            }

            const repetedCode = await ProductModel.findOne({ "code": body.code })

            if (repetedCode) {
                CustomError.createError({
                    name: "Error al actualizar el producto",
                    cause: generateProductErrorInfo(product),
                    message: `Ya existe el producto con el CODE: ${body.code}`,
                    code: EErrors.INVALID_TYPES_ERROR
                })
                //return res.status(404).json({ message: `Ya existe el producto con el CODE: ${body.code}` });
            }

            const actualizado = await ProductModel.findOneAndUpdate({ _id: pid }, body, { new: true })

            res.status(200).json({ message: "success", data: actualizado })

        }
        catch (error) {
            res.status(500).send(error)
        }
    }

    getProducts = async (limit, page, query, req, res) => {

        try {
            const options = {
                limit,
                page
            }

            const filter = query ? query === "0" ? { stock: 0 } : { category: query } : {}

            let result = await ProductModel.paginate(filter, options)

            let status = result ? "success" : "error"

            let queryFormated = query ? req.query.query.replace(/ /g, "%20") : ""

            let response = {
                status,
                totalPages: result.totalPages,
                count: result.totalDocs,
                prevLink: result.hasPrevPage ? `/products?limit=${options.limit}&page=${result.prevPage}&sort=${req.query.sort}${query ? `&query=${queryFormated}` : ""}` : null,
                nextLink: result.hasNextPage ? `/products?limit=${options.limit}&page=${result.nextPage}${query ? `&query=${queryFormated}` : ""}` : null,
                payload: result.docs

            }

            res.status(200).json({ message: "success", response })

        }
        catch (error) {
            res.status(500).send(error)
        }
    }

    getProductsView = async (limit, page, sort, query, req, res) => {

        try {
            const options = {
                limit,
                page,
                sort: sort === "asc" ? { price: 1 } : sort === "desc" ? { price: -1 } : undefined
            }

            const filter = query ? query === "0" ? { stock: 0 } : { category: query } : {}

            let result = await ProductModel.paginate(filter, options)

            const product = result.docs.map((e) => {
                return {
                    _id: e._id,
                    title: e.title,
                    description: e.description,
                    code: e.code,
                    price: e.price,
                    status: e.status,
                    stock: e.stock,
                    category: e.category,
                    thumbnails: e.thumbnails
                }
            })

            let status = result ? "success" : "error"


            let queryFormated = query ? req.query.query.replace(/ /g, "%20") : ""

            const user = await req.user

            let isAdmin = false

            if (user.role === "admin") {
                isAdmin = true
            }

            let response = {
                status,
                payload: { product, user, isAdmin },
                totalPages: result.totalPages,
                prevPage: result.prevPage,
                nextPage: result.nextPage,
                page: result.page,
                hasPrevPage: result.hasPrevPage,
                hasNextPage: result.hasNextPage,
                prevLink: result.hasPrevPage ? `/products?limit=${options.limit}&page=${result.prevPage}&sort=${req.query.sort}${query ? `&query=${queryFormated}` : ""}` : null,
                nextLink: result.hasNextPage ? `/products?limit=${options.limit}&page=${result.nextPage}&sort=${req.query.sort}${query ? `&query=${queryFormated}` : ""}` : null
            }

            return response
        }
        catch (error) {
            res.status(500).send(error)
        }
    }

}
