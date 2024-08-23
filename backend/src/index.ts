import { addProductToCard, getCartContentsForUser, getCartIdForUser, getUserIdForUsername, insertProducts, insertUsers, queryProducts } from "./databaseOperations";
import { generateMockProductData, generateMockUserData } from "./mockData";

async function main() {
    try {
        const userId = await getUserIdForUsername("Ryder4")
        console.log(userId)
    } catch (err) {
        console.log("error: ", err)
    }
}

main()
