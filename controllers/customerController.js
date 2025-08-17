import Customer from "../models/Customer.js";

export async function listCustomers(_req, res, next) {
  try {
    const list = await Customer.find().sort({ createdAt: -1 });
    res.json(list);
  } catch (e) { next(e); }
}

export async function createCustomer(req, res, next) {
  try {
    const c = await Customer.create(req.body);
    res.status(201).json(c);
  } catch (e) { next(e); }
}

export async function updateCustomer(req, res, next) {
  try {
    const c = await Customer.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!c) return res.status(404).json({ message: "Customer not found" });
    res.json(c);
  } catch (e) { next(e); }
}

export async function removeCustomer(req, res, next) {
  try {
    const c = await Customer.findByIdAndDelete(req.params.id);
    if (!c) return res.status(404).json({ message: "Customer not found" });
    res.json({ message: "Deleted" });
  } catch (e) { next(e); }
}
