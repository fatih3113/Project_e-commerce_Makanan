import express from "express";
import cors from "cors";

import productCategoryRoutes from "./routes/product_categoriesRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import customersRoutes from "./routes/customersRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import loginRoutes from "./routes/loginRoutes.js";
import DashboardRoutes from "./routes/DashboardRoutes.js";


const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());

app.use("/product_categories", productCategoryRoutes);
app.use("/product", productRoutes);
app.use("/customers", customersRoutes);
app.use("/orders", orderRoutes);
app.use("/api", loginRoutes);
app.use("/api", DashboardRoutes);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
