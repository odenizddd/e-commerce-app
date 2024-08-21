import { addProductToCard, getCartContentsForUser, getCartIdForUser, insertProducts, insertUsers, queryProducts } from "./databaseOperations";
import { generateMockProductData, generateMockUserData } from "./mockData";

async function main() {
    try {
        await addProductToCard(2, 5, 2)
    } catch (err) {
        console.log("error: ", err)
    }
}

main()
