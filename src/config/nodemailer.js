import nodemailer from "nodemailer"

export const transport = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
        user: "guille.13577@gmail.com",
        pass: "kxom klcy tbpz mqdo"
    }
})