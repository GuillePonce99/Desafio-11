import UserModel from "../models/users.model.js"
import { createHash, generateToken, isValidPassword } from "../../../utils.js"
import Config from "../../../config/config.js"
import EErrors from "../../../services/errors/enums.js"
import { generateUserErrorInfo } from "../../../services/errors/info.js"
import CustomError from "../../../services/errors/CustomError.js"
import { signupDTO, userDTO } from "../../DTOs/session.dto.js"

export default class Sessions {
    constructor() { }
    login = async (req, res) => {
        const { email, password } = req.body
        try {
            if (email === Config.ADMIN_EMAIL && password === Config.ADMIN_PASSWORD) {
                const token = generateToken({
                    email,
                    role: "admin",
                    admin: true
                })

                req.logger.info(`ADMIN ha iniciado sesion - DATE:${new Date().toLocaleTimeString()}`)

                res.cookie("coderCookieToken", token, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true
                }).status(200).json({ message: "success" })

            } else if (email === Config.ADMIN_EMAIL && password !== Config.ADMIN_PASSWORD) {
                req.logger.error(`Error al iniciar sesion (ADMIN) : La contraseña es incorrecta!`)
                CustomError.createError({
                    name: "Error al iniciar sesion",
                    cause: generateUserErrorInfo(user),
                    message: "Contraseña incorrecta!",
                    code: EErrors.INVALID_TYPES_ERROR
                })
                return res.status(401).json({ message: "Contraseña incorrecta!" })

            } else {

                const user = await UserModel.findOne({ email })
                if (user === null) {
                    req.logger.error(`Error al iniciar sesion: El email es incorrecta!`)
                    CustomError.createError({
                        name: "Error al iniciar sesion",
                        cause: generateUserErrorInfo(user),
                        message: "Email incorrecto!",
                        code: EErrors.INVALID_TYPES_ERROR
                    })
                    return res.status(401).json({ message: "" })
                } else if (!isValidPassword(password, user)) {
                    req.logger.error(`Error al iniciar sesion: La contraseña es incorrecta!`)
                    CustomError.createError({
                        name: "Error al iniciar sesion",
                        cause: generateUserErrorInfo(user),
                        message: "Contraseña incorrecta!",
                        code: EErrors.INVALID_TYPES_ERROR
                    })
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

                req.logger.info(`El usuario ${email} ha iniciado sesion - DATE:${new Date().toLocaleTimeString()}`)

                res.cookie("coderCookieToken", token, {
                    maxAge: 60 * 60 * 1000,
                    httpOnly: true
                }).status(200).json({ message: "success" })
            }

        } catch (error) {
            res.status(500).send(error)
        }

    }

    loginGitHub = async (req, res) => {
        const user = req.user
        try {
            let token = generateToken({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                age: user.age,
                role: "user"
            })

            req.logger.info(`El usuario ${user.email} ha iniciado sesion mediante GitHub - DATE:${new Date().toLocaleTimeString()}`)

            res.cookie("coderCookieToken", token, {
                maxAge: 60 * 60 * 1000,
                httpOnly: true
            }).redirect("/products")

        } catch (error) {
            res.status(500).send(error)
        }

    }

    signup = async (req, res) => {
        let user = new signupDTO(req.body)
        try {

            const repetedEmail = await UserModel.findOne({ email: user.email })

            if (repetedEmail) {
                req.logger.error(`Error al crear un usuario : El email ${user.email} ya se encuentra en uso!`)
                CustomError.createError({
                    name: "Error al registrarse",
                    cause: generateUserErrorInfo(user),
                    message: "El email ingresado ya existe!",
                    code: EErrors.DATABASE_ERROR
                })
                //return res.status(401).json({ message: "El email ingresado ya existe!" })
            }

            if (user.age <= 0 || user.age >= 100) {
                req.logger.error(`Error al crear un usuario : La edad ingresada no es correcta!`)
                CustomError.createError({
                    name: "Error al registrarse",
                    cause: generateUserErrorInfo(user),
                    message: "Ingrese una edad correcta!",
                    code: EErrors.INVALID_TYPES_ERROR
                })
                return res.status(401).json({ message: "Ingrese una edad correcta!" })
            }

            user.password = createHash(user.password)
            user = { ...user, role: "user" }

            const result = await UserModel.create(user)

            req.logger.info(`Se ha creado un nuevo usuario : ${result.email} - DATE:${new Date().toLocaleTimeString()}`)

            res.send({ result })

        }
        catch (error) {
            res.status(500).send(error)
        }

    }

    forgot = async (req, res) => {
        const { email, newPassword } = req.body
        try {
            const user = await UserModel.findOne({ email })

            if (!user) {
                req.logger.error(`Error al cambiar la contraseña : El email ${email} no se ha encontrado!`)
                CustomError.createError({
                    name: "Error al cambiar la contraseña",
                    cause: generateUserErrorInfo(user),
                    message: "Email incorrecto!",
                    code: EErrors.DATABASE_ERROR
                })
                return res.status(401).json({ message: "Email incorrecto!" })
            }

            user.password = createHash(newPassword)

            await user.save()

            req.logger.info(`Se ha cambiado la contraseña del usuario ${email} - DATE:${new Date().toLocaleTimeString()}`)

            return res.json({ message: "Se ha cambiado la contraseña" })

        }
        catch (error) {
            res.status(500).send(error)
        }
    }

    logout = async (req, res) => {
        req.logger.info(`El usuario ${req.user.email} ha cerrado sesion - DATE:${new Date().toLocaleTimeString()}`)
        return res.send({ status: "success" })

    }

    current = async (req, res) => {
        const user = new userDTO(req.user)
        return res.send(user)
    }
}
