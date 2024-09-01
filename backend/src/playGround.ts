import { addProductToCard, createOrderForUser, getCartContentsForUser, getCartIdForUser, getOrderContentsForOrder, getOrdersForUser, getRatings, getReviews, getUserIdForUsername } from "./databaseOperations"

const username = "Jade_Nienow38"

const main = async () => {
    const reviews = await getRatings(2,1)
    console.log(reviews)
}

main()
