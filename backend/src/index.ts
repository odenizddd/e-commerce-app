import { addProductToCard, getCartContentsForUser, getCartIdForUser, insertProducts, insertUsers, queryProducts } from "./databaseOperations";
import { generateMockProductData, generateMockUserData } from "./mockData";

async function main() {
    try {
        const cartContent = await getCartContentsForUser(1)
        console.log(cartContent.rows)
    } catch (err) {
        console.log("error: ", err)
    }
}

main()
