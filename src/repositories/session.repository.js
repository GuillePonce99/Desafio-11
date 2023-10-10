import { signupDTO, userDTO } from "../dao/DTOs/session.dto.js"
export default class SessionRepository {
    constructor(dao) {
        this.dao = dao
    }
    login = async (req, res) => {
        const { email, password } = req.body
        return await this.dao.login(email, password, res)
    }

    loginGitHub = async (req, res) => {
        const user = req.user
        return await this.dao.loginGitHub(user, res)
    }

    signup = async (req, res) => {
        let user = new signupDTO(req.body)
        return await this.dao.signup(user, res)
    }

    forgot = async (req, res) => {
        const { email, newPassword } = req.body
        return await this.dao.forgot(email, newPassword, res)
    }

    logout = async (req, res) => {
        return await this.dao.logout(res)
    }

    current = async (req, res) => {
        const user = new userDTO(req.user)
        return await this.dao.current(user, res)
    }
}