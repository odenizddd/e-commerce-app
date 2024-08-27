import { addProductToCard, createOrderForUser, getCartContentsForUser, getCartIdForUser, getOrderContentsForOrder, getOrdersForUser, getUserIdForUsername } from "./databaseOperations"

const username = "Jade_Nienow38"

const main = async () => {
    const userId = await getUserIdForUsername(username)
    const cartId = await getCartIdForUser(userId)
    // await addProductToCard(cartId, 9, 120)
    // await createOrderForUser(username)
    console.log(await getOrderContentsForOrder(4))
}

main()
