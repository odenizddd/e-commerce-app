import { getCartIdForUser, insertProducts, insertUsers, queryProducts } from "./databaseOperations";
import { generateMockProductData, generateMockUserData } from "./mockData";

async function main() {
    try {
        const cartId = await getCartIdForUser(1)
        console.log(cartId)
    } catch (err) {
        console.log("error: ", err)
    }
}

main()
