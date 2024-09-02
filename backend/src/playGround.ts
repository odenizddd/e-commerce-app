import { addProductToCard, createOrderForUser, getCartContentsForUser, getCartIdForUser, getOrderContentsForOrder, getOrdersForUser, getRatings, getReviews, getUserIdForUsername, updateProductQuantityInCard } from "./databaseOperations"

const username = "Jade_Nienow38"

const main = async () => {
    await updateProductQuantityInCard(3, 2, -1)
}

main()
