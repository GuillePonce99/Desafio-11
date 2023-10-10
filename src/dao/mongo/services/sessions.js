import UserModel from "../models/users.model.js"
import { createHash, generateToken, isValidPassword } from "../../../utils.js"
import Config from "../../../config/config.js"
import EErrors from "../../../services/errors/enums.js"
import { generateUserErrorInfo } from "../../../services/errors/info.js"
import CustomError from "../../../services/errors/CustomError.js"

export default class Sessions {
    constructor() { }
    login = async (email, password, res) => {

        try {
            if (email === Config.ADMIN_EMAIL && password === Config.ADMIN_PASSWORD) {
                const token = generateToken({
                    email,
                    role: "admin",
                    admin: true
                })

                res.cookie("coderCookieToken", token, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true
                }).status(200).json({ message: "success" })
            } else if (email === Config.ADMIN_EMAIL && password !== Config.ADMIN_PASSWORD) {
                return res.status(401).json({ message: "Contraseña incorrecta!" })
            } else {

                const user = await UserModel.findOne({ email })
                if (user === null) {
                    return res.status(401).json({ message: "Email incorrecto!" })
                } else if (!isValidPassword(password, user)) {
                    return res.status(401).json({ message: "Contraseña incorrecta!" })
                }

                const token = generateToken({
                    email,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    age: user.age,
                    role: "user",
                    admin: false
                })

                res.cookie("coderCookieToken", token, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true
                }).status(200).json({ message: "success" })
            }

        } catch (error) {
            res.status(500).send(error)
        }

    }

    loginGitHub = async (user, res) => {

        try {
            let token = generateToken({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                age: user.age,
                role: "user"
            })

            res.cookie("coderCookieToken", token, {
                maxAge: 60 * 60 * 1000,
                httpOnly: true
            }).redirect("/products")

        } catch (error) {
            res.status(500).send(error)
        }

    }

    signup = async (user, res) => {
        try {

            const repetedEmail = await UserModel.findOne({ email: user.email })

            if (repetedEmail) {
                CustomError.createError({
                    name: "Error al registrarse",
                    cause: generateUserErrorInfo(user),
                    message: "El email ingresado ya existe!",
                    code: EErrors.DATABASE_ERROR
                })
                //return res.status(401).json({ message: "El email ingresado ya existe!" })
            }

            if (user.age <= 0 || user.age >= 100) {
                return res.status(401).json({ message: "Ingrese una edad correcta!" })
            }

            user.password = createHash(user.password)
            user = { ...user, role: "user" }

            const result = await UserModel.create(user)

            res.send({ result })

        }
        catch (error) {
            res.send(error)
        }

    }

    forgot = async (email, newPassword, res) => {

        try {
            const user = await UserModel.findOne({ email })

            if (!user) {
                return res.status(401).json({ message: "Email incorrecto!" })
            }

            user.password = createHash(newPassword)

            await user.save()


            return res.json({ message: "Se ha cambiado la contraseña" })


        }
        catch (error) {
            res.status(500).send(error)
        }
    }

    logout = async (res) => {

        return res.send({ status: "success" })

    }

    current = async (user, res) => {
        return res.send(user)
    }
}
