
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

    const company = await Company.findOneAndUpdate(
      { owner: req.user.id },
      {
        $set: {
          companyName,
          gstin,
          email:
            typeof req.body.email === "string"
              ? req.body.email.trim().toLowerCase()
              : "",
          phone:
            typeof req.body.phone === "string"
              ? req.body.phone.trim()
              : "",
          address:
            typeof req.body.address === "string"
              ? req.body.address.trim()
              : "",
          state:
            typeof req.body.state === "string"
              ? req.body.state.trim()
              : "",
          pinCode:
            typeof req.body.pinCode === "string"
              ? req.body.pinCode.trim()
              : ""
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

