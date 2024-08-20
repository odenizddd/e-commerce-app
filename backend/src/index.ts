import { insertProducts, queryProducts } from "./databaseOperations";

async function main() {
    try {
        const products = await queryProducts()
        console.log(products)
    } catch (err) {
        console.log("error: ", err)
    }
}

main()
