
import Invoice from "../models/Invoice.js";
import Product from "../models/Product.js";
import Company from "../models/Company.js";
import InvoiceCounter from "../models/InvoiceCounter.js";
import Customer from "../models/Customer.js";

const roundMoney = (value) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const getStateCode = (gstin) => {
  const value = String(gstin || "").trim().toUpperCase();
  return /^\d{2}[A-Z0-9]{13}$/.test(value)
    ? value.slice(0, 2)
    : "";
};

const normalizeState = (state) =>
  String(state || "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

const getNextInvoiceNumber = async () => {
  const counter = await InvoiceCounter.findOneAndUpdate(
    { _id: "invoice" },
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `INV-${String(counter.sequence).padStart(5, "0")}`;
};

export async function listInvoices(_req, res, next) {
  try {
    const invoices = await Invoice.find()
      .populate("customer")
      .populate("items.product")
      .sort({ createdAt: -1 });

    res.json(invoices);
  } catch (error) {
    next(error);
  }
}

export async function getInvoice(req, res, next) {
  try {
    const invoice = await Invoice.findById(req.params.id)
      .populate("customer")
      .populate("items.product");

    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  } catch (error) {
    next(error);
  }
}

export async function createInvoice(req, res, next) {
  try {
    const { 
      customer: customerId, 
      items, 
      notes = "",
         invoiceNumber: requestedInvoiceNumber,
         invoiceDate: requestedInvoiceDate
    } = req.body;

    if (!customerId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        message: "Select a customer and add at least one invoice item."
      });
    }

    const company = await Company.findOne({ owner: req.user.id });

    if (!company) {
      return res.status(400).json({
        message: "Set up your company details before creating an invoice."
      });
    }

    const customer = await Customer.findById(customerId);

    if (!customer) {
      return res.status(400).json({ message: "Customer not found." });
    }

    const sellerStateCode = getStateCode(company.gstin);
    const buyerStateCode =
      customer.stateCode || getStateCode(customer.gstin);

    const sellerState = normalizeState(company.state);
    const buyerState = normalizeState(customer.state);

    let interstate;

    if (sellerStateCode && buyerStateCode) {
      interstate = sellerStateCode !== buyerStateCode;
    } else if (sellerState && buyerState) {
      interstate = sellerState !== buyerState;
    } else {
      return res.status(400).json({
        message:
          "GST cannot be calculated automatically. Add your company's state and the customer's state or valid GSTIN."
      });
    }

    let subtotal = 0;
    let taxableAmount = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;
    const computedItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);

      if (!product) {
        return res.status(400).json({
          message: "One of the selected products was not found."
        });
      }

      const qty = Number(item.qty);
      const price = Number(item.price ?? product.price);
      const gstRate = Number(item.gstRate ?? product.gstRate ?? 0);
      const priceMode = item.priceMode || req.body.priceMode || "exclusive";

      if (
        !Number.isFinite(qty) ||
        qty <= 0 ||
        !Number.isFinite(price) ||
        price < 0 ||
        !Number.isFinite(gstRate) ||
        gstRate < 0 ||
        gstRate > 100 ||
        !["inclusive", "exclusive"].includes(priceMode)
      ) {
        return res.status(400).json({
          message: `Invalid quantity, price, or GST settings for ${product.name}.`
        });
      }
    
      const enteredLineAmount = roundMoney(qty * price);
      const discountPercent = Number(item.discountPercent ?? 0);
      const requestedDiscountAmount = Number(item.discountAmount ?? 0);

      if (
        !Number.isFinite(discountPercent) ||
        discountPercent < 0 ||
        discountPercent > 100 ||
        !Number.isFinite(requestedDiscountAmount) ||
        requestedDiscountAmount < 0
      ) {
        return res.status(400).json({
          message: `Invalid discount settings for ${product.name}.`
        });
      }

      const discountAmount = roundMoney(
        requestedDiscountAmount > 0
          ? requestedDiscountAmount
          : enteredLineAmount * discountPercent / 100
      );

      if (discountAmount > enteredLineAmount) {
        return res.status(400).json({
          message: `Discount cannot exceed the item amount for ${product.name}.`
        });
      }

      const discountedLineAmount = roundMoney(
        enteredLineAmount - discountAmount
      );

      const lineTaxable = roundMoney(
        priceMode === "inclusive"
          ? discountedLineAmount / (1 + gstRate / 100)
          : discountedLineAmount
      );

      const taxAmount = roundMoney(
        priceMode === "inclusive"
          ? discountedLineAmount - lineTaxable
          : lineTaxable * gstRate / 100
      );

      const cgst = interstate ? 0 : roundMoney(taxAmount / 2);
      const sgst = interstate ? 0 : roundMoney(taxAmount - cgst);
      const igst = interstate ? taxAmount : 0;

      const lineTotal = roundMoney(
        priceMode === "inclusive"
          ? discountedLineAmount
          : lineTaxable + taxAmount
      );

      const savedDiscountPercent = enteredLineAmount > 0
        ? roundMoney((discountAmount / enteredLineAmount) * 100)
        : 0;

      subtotal += enteredLineAmount;
      taxableAmount += lineTaxable;
      totalCgst += cgst;
      totalSgst += sgst;
      totalIgst += igst;

      computedItems.push({
        product: product._id,
        description: String(item.description ?? product.description ?? ""),
        hsnSac: String(item.hsnSac ?? product.hsnSac ?? "").trim(),
        unit: String(item.unit ?? product.unit ?? "Nos").trim() || "Nos",
        qty,
        price,
        priceMode,
        discountPercent: savedDiscountPercent,
        discountAmount,
        gstRate,
        taxableAmount: lineTaxable,
        cgst,
        sgst,
        igst,
        taxAmount,
        lineTotal
      });
    }
    taxableAmount = roundMoney(taxableAmount);
    totalCgst = roundMoney(totalCgst);
    totalSgst = roundMoney(totalSgst);
    totalIgst = roundMoney(totalIgst);

    const tax = roundMoney(totalCgst + totalSgst + totalIgst);
    const total = roundMoney(taxableAmount + tax);

    const customInvoiceNumber = String(
      requestedInvoiceNumber || ""
    ).trim();

    if (customInvoiceNumber.length > 50) {
      return res.status(400).json({
        message: "Invoice number must be 50 characters or fewer."
     });
   }

   if (
     customInvoiceNumber &&
   await Invoice.exists({ invoiceNumber: customInvoiceNumber })
   ) {
    return res.status(409).json({
      message: "This invoice number already exists. Enter a different number."
    });
   }

    let invoiceDate = new Date();

    if (requestedInvoiceDate) {
      invoiceDate = new Date(`${requestedInvoiceDate}T00:00:00.000Z`);

    if (Number.isNaN(invoiceDate.getTime())) {
      return res.status(400).json({
        message: "Enter a valid invoice date."
      });
      }
    }
 
    const invoiceNumber =
      customInvoiceNumber || await getNextInvoiceNumber();

    const invoice = await Invoice.create({
      invoiceNumber,
      invoiceDate,
      customer: customer._id,
      items: computedItems,
      sellerSnapshot: {
        companyName: company.companyName || "",
        gstin: company.gstin || "",
        email: company.email || "",
        phone: company.phone || "",
        address: company.address || "",
        state: company.state || "",
        pinCode: company.pinCode || ""
      },
      customerSnapshot: {
        name: customer.name || "",
        gstin: customer.gstin || "",
        email: customer.email || "",
        phone: customer.phone || "",
        address: customer.address || "",
        state: customer.state || ""
      },
      supplyType: interstate ? "inter-state" : "intra-state",
      subtotal,
      taxableAmount,
      cgst: totalCgst,
      sgst: totalSgst,
      igst: totalIgst,
      tax,
      total,
      notes: String(notes || ""),
      status: "draft"
    });

    const populated = await invoice
      .populate("customer")
      .then((doc) => doc.populate("items.product"));

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
}


