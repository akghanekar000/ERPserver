import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";

export async function listInvoices(_req, res, next) {
  try {
    const inv = await Invoice.find()
      .populate("customer")
      .populate("items.product")
      .sort({ createdAt: -1 });
    res.json(inv);
  } catch (e) { next(e); }
}

export async function getInvoice(req, res, next) {
  try {
    const inv = await Invoice.findById(req.params.id).populate("customer").populate("items.product");
    if (!inv) return res.status(404).json({ message: "Invoice not found" });
    res.json(inv);
  } catch (e) { next(e); }
}

export async function createInvoice(req, res, next) {
  try {
    const { customer, items, tax = 0 } = req.body;
    let subtotal = 0;
    const computedItems = [];
    for (const it of items) {
      const prod = await Product.findById(it.product);
      if (!prod) return res.status(400).json({ message: "Invalid product in items" });
      const price = it.price != null ? it.price : prod.price;
      const qty = it.qty || 1;
      subtotal += price * qty;
      computedItems.push({ product: prod._id, qty, price });
    }
    const total = subtotal + tax;
    const inv = await Invoice.create({ customer, items: computedItems, subtotal, tax, total });
    const populated = await inv.populate("customer").populate("items.product");
    res.status(201).json(populated);
  } catch (e) { next(e); }
}
