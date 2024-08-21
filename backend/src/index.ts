import { addProductToCard, getCartIdForUser, insertProducts, insertUsers, queryProducts } from "./databaseOperations";
import { generateMockProductData, generateMockUserData } from "./mockData";

async function main() {
    try {
        const cartId = await getCartIdForUser(1)
        await addProductToCard(cartId, 1, 3)
    } catch (err) {
        console.log("error: ", err)
    }
}

main()
