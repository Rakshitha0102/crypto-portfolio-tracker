const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    symbol: {
      type: String,
      required: [true, "Coin symbol is required"],
      uppercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Coin name is required"],
      trim: true,
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [0, "Quantity cannot be negative"],
    },
    buyPrice: {
      type: Number,
      required: [true, "Buy price is required"],
      min: [0, "Buy price cannot be negative"],
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Coin", coinSchema);