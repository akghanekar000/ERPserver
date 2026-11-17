
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

      if (typeof value !== "string") return "";

      const trimmed = value.trim();
      return uppercase ? trimmed.toUpperCase() : trimmed;
    };

    const updates = {
      companyName,
      gstin,
      email: stringField("email").toLowerCase(),
      phone: stringField("phone"),
      address: stringField("address"),
      state: stringField("state"),
      pinCode: stringField("pinCode"),
      bankName: stringField("bankName"),
      accountHolder: stringField("accountHolder"),
      accountNumber: stringField("accountNumber"),
      ifscCode: stringField("ifscCode", true),
      branch: stringField("branch")
    };

    // Save numbering preferences only when supplied.
    if (req.body.invoiceNumbering !== undefined) {
      const settings = req.body.invoiceNumbering;

      if (
        !settings ||
        typeof settings.automaticNumbering !== "boolean" ||
        typeof settings.savePrefixForFuture !== "boolean"
      ) {
        return res.status(400).json({
          message: "Invalid invoice numbering settings."
        });
      }

      const shouldSavePrefix =
        settings.savePrefixForFuture === true;

      const savedPrefix = shouldSavePrefix
        ? String(settings.savedPrefix || "").trim()
        : "";

      if (savedPrefix.length > 15 || /\s/.test(savedPrefix)) {
        return res.status(400).json({
          message: "Prefix must be 15 characters or fewer and contain no spaces."
        });
      }

      updates.invoiceNumbering = {
        automaticNumbering: settings.automaticNumbering,
        savePrefixForFuture: shouldSavePrefix,
        savedPrefix,
        usePrefix: false
      };
    }

    const company = await Company.findOneAndUpdate(
      { owner: req.user.id },
      { $set: updates },
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
