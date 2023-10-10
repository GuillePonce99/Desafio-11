import { Command } from "commander"
const program = new Command()
program.option("-persistence <persistence>", "persistencia de datos", "MONGO").option("-p <port>", "port", 8080).parse()
export const options = program.opts();