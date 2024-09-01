import { insertProducts, insertRatings, insertReviews, insertUsers } from "./databaseOperations"
import { generateMockProductData, generateMockRatings, generateMockReviews, generateMockUserData } from "./mockData"

const main = async () => {
    await insertUsers(await generateMockUserData(10))
    await insertProducts(await generateMockProductData(10))
    const ratings = await generateMockRatings(4, 3)
    await insertRatings(ratings)
    const reviews = await generateMockReviews(2, 3)
    await insertReviews(reviews)
} 

main()
