import { insertProducts, insertUsers } from "./databaseOperations"
import { generateMockProductData, generateMockUserData } from "./mockData"

const main = async () => {
    await insertUsers(await generateMockUserData(10))
    await insertProducts(await generateMockProductData(10))
} 

main()
