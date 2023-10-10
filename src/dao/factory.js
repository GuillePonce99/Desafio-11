import Config from "../config/config.js";
export let Products
export let Carts
export let Sessions
export let Tickets

switch (Config.PERSISTENCE) {
    case "MONGO":
        console.log("PERSISTENCIA: ", Config.PERSISTENCE);
        const { default: ProductMongo } = await import("./mongo/services/products.js")
        const { default: CartsMongo } = await import("./mongo/services/carts.js")
        const { default: SessionsMongo } = await import("./mongo/services/sessions.js")
        const { default: TicketsMongo } = await import("./mongo/services/tickets.js")
        Products = ProductMongo
        Carts = CartsMongo
        Sessions = SessionsMongo
        Tickets = TicketsMongo
        break;

    case "MEMORY":
        console.log("PERSISTENCIA: ", Config.PERSISTENCE);
        const { default: ProductMemory } = await import("./memory/services/products.js")
        const { default: CartsMemory } = await import("./memory/services/carts.js")
        const { default: SessionsMemory } = await import("./mongo/services/sessions.js")
        const { default: TicketsMemory } = await import("./mongo/services/tickets.js")

        Products = ProductMemory
        Carts = CartsMemory
        Sessions = SessionsMemory
        Tickets = TicketsMemory
        break;
}