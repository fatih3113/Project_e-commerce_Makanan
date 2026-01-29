import express from "express";
import {
  getCustomers,
  getCustomerById,
  insertCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controller/customersController.js";

const router = express.Router();

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", insertCustomer);
router.put("/:id", updateCustomer);
router.delete("/:id", deleteCustomer);

export default router;
