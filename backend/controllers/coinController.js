const Coin = require("../models/Coin");

// @route  POST /api/v1/coins
// @desc   Add a coin to portfolio
exports.addCoin = async (req, res) => {
  try {
    const { symbol, name, quantity, buyPrice, notes } = req.body;

    const coin = await Coin.create({
      user: req.user.id,
      symbol,
      name,
      quantity,
      buyPrice,
      notes,
    });

    res.status(201).json({ success: true, message: "Coin added", coin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/coins
// @desc   Get all coins for logged-in user
exports.getMyCoins = async (req, res) => {
  try {
    const coins = await Coin.find({ user: req.user.id }).sort({ createdAt: -1 });

    // Calculate profit/loss for each coin
    const portfolio = coins.map((coin) => ({
      ...coin._doc,
      totalInvested: coin.quantity * coin.buyPrice,
    }));

    res.status(200).json({ success: true, count: coins.length, portfolio });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  PUT /api/v1/coins/:id
// @desc   Update a coin
exports.updateCoin = async (req, res) => {
  try {
    let coin = await Coin.findById(req.params.id);

    if (!coin) {
      return res.status(404).json({ success: false, message: "Coin not found" });
    }

    // Make sure user owns this coin
    if (coin.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    coin = await Coin.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({ success: true, message: "Coin updated", coin });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  DELETE /api/v1/coins/:id
// @desc   Delete a coin
exports.deleteCoin = async (req, res) => {
  try {
    const coin = await Coin.findById(req.params.id);

    if (!coin) {
      return res.status(404).json({ success: false, message: "Coin not found" });
    }

    if (coin.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized" });
    }

    await coin.deleteOne();

    res.status(200).json({ success: true, message: "Coin removed from portfolio" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @route  GET /api/v1/coins/admin/all
// @desc   Admin: get ALL users' portfolios
exports.getAllCoins = async (req, res) => {
  try {
    const coins = await Coin.find().populate("user", "name email role");

    res.status(200).json({ success: true, count: coins.length, coins });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};