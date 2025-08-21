import Product from "../models/Product.js";

export async function listProducts(_req, res, next) {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (e) { next(e); }
}

export async function getProduct(req, res, next) {
  try {
    const p = await Product.findById(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (e) { next(e); }
}

export async function createProduct(req, res, next) {
  try {
    const payload = req.body;
    const product = await Product.create(payload);
    res.status(201).json(product);
  } catch (e) { next(e); }
}

export async function updateProduct(req, res, next) {
  try {
    const p = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json(p);
  } catch (e) { next(e); }
}

export async function removeProduct(req, res, next) {
  try {
    const p = await Product.findByIdAndDelete(req.params.id);
    if (!p) return res.status(404).json({ message: "Product not found" });
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
}
