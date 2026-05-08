const express = require("express");
const router = express.Router();
const {
  addCoin,
  getMyCoins,
  updateCoin,
  deleteCoin,
  getAllCoins,
} = require("../controllers/coinController");
const { protect, adminOnly } = require("../middleware/auth");

router.post("/", protect, addCoin);
router.get("/", protect, getMyCoins);
router.put("/:id", protect, updateCoin);
router.delete("/:id", protect, deleteCoin);
router.get("/admin/all", protect, adminOnly, getAllCoins);

module.exports = router;