const express = require("express");
const router = express.Router();
// const bodyParser = require("body-parser");
// const Activity = require("../models/activity.model");
const Category = require("../models/category.model");
// const { authMiddleware } = require("../middlewares/auth.middleware");

router.get("/", async (req, res) => {
  const category = await Category.find();

  res.status(200).send(category);
});

router.delete("/", async (req, res) => {
  await Category.deleteMany();
  const categoryFind = await Category.find();

  res.status(200).send(categoryFind);
});

router.post("/", async (req, res) => {
  if (!req.body.name) {
    return res.status(400).send("category is missing");
  }

  try {
    const category = await Category.create({
      name: req.body.name,
    });

    await category.save();
    return res.status(200).json(category);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/id/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await Category.findByIdAndDelete(id);
    return res.status(200).json({ message: "Category deleted successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ error: "An error occurred while deleting the user" });
  }
});

router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const category = await Category.findByIdAndUpdate(
      id,
      { name },
      { new: true }
    );

    if (!category) {
      return res.status(404).json({ error: "Category not found" });
    }

    return res.status(200).json(category);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update category" });
  }
});

module.exports = router;
