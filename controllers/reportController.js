import Invoice from "../models/Invoice.js";

export async function salesSummary(_req, res, next) {
  try {
    const list = await Invoice.find();
    const totalSales = list.reduce((sum, i) => sum + i.total, 0);
    res.json({ totalSales, count: list.length });
  } catch (e) { next(e); }
}
