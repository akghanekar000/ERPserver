
import Company from "../models/Company.js";

export async function getCompany(req, res, next) {
  try {
    const company = await Company.findOne({
      owner: req.user.id
    });

    res.json(company);
  } catch (error) {
    next(error);
  }
}

export async function saveCompany(req, res, next) {
  try {
    const companyName =
      typeof req.body.companyName === "string"
        ? req.body.companyName.trim()
        : "";

    if (!companyName) {
      return res.status(400).json({
        message: "Company name is required."
      });
    }

    const gstin =
      typeof req.body.gstin === "string"
        ? req.body.gstin.trim().toUpperCase()
        : "";

    if (gstin && !/^[0-9A-Z]{15}$/.test(gstin)) {
      return res.status(400).json({
        message: "GSTIN must contain 15 letters and numbers."
      });
    }

    const stringField = (field, uppercase = false) => {
      const value = req.body[field];

      if (typeof value !== "string") {
        return "";
      }

      const trimmed = value.trim();
      return uppercase ? trimmed.toUpperCase() : trimmed;
    };

    const company = await Company.findOneAndUpdate(
      { owner: req.user.id },
      {
        $set: {
          companyName,
          gstin,
          email: stringField("email").toLowerCase(),
          phone: stringField("phone"),
          address: stringField("address"),
          state: stringField("state"),
          pinCode: stringField("pinCode"),

          // Bank details
          bankName: stringField("bankName"),
          accountHolder: stringField("accountHolder"),
          accountNumber: stringField("accountNumber"),
          ifscCode: stringField("ifscCode", true),
          branch: stringField("branch")
        }
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
        setDefaultsOnInsert: true
      }
    );

    res.json({
      message: "Company details saved successfully.",
      company
    });
  } catch (error) {
    next(error);
  }
}

