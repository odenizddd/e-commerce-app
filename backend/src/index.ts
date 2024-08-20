import { insertProducts } from "./databaseOperations";
import { generateMockProductData } from "./mockData";

insertProducts(generateMockProductData(10))
