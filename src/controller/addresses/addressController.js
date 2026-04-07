const db = require("../../../config/dbConfig");
const { addAddressSchema } = require("../../validations/addressValidation");

const createAddress = async (req, res) => {
  try {
    const { error, value } = addAddressSchema.validate(req.body || {});

    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(400).json({
        status: false,
        message: message,
      });
    }

    let {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      is_default,
      user_id,
    } = value;
    const [existingAddress] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ? AND is_default = ?",
      [user_id, 1],
    );
    if (existingAddress.length === 0) {
      is_default = 1;
    }
    if (existingAddress.length > 0 && is_default === 1) {
      await db.query("UPDATE addresses SET is_default = 0 WHERE user_id = ?", [
        user_id,
      ]);
    }
    if (existingAddress?.length >= 5) {
      return res.status(400).json({
        status: false,
        message: "You can only add 5 addresses ",
      });
    }

    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    if (!user.length) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    await db.query(
      "INSERT INTO  addresses (name,email,phone,user_id,address,city,state,zip_code,country,is_default) VALUES (?,?,?,?,?,?,?,?,?,?)",
      [
        name,
        email,
        phone,
        user_id,
        address,
        city,
        state,
        zip_code,
        country,
        is_default,
      ],
    );

    return res.status(201).json({
      status: true,
      message: "Address Created Successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getAddressByID = async (req, res) => {
  try {
    const { id } = req.params;
    const [address] = await db.query("SELECT * FROM addresses WHERE id =? ", [
      id,
    ]);
    return res.status(200).json({
      status: true,
      data: address,
      message: "Add fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const getAllAddressUser = async (req, res) => {
  try {
    const { user_id } = req.params;
    const [address] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ?  ",
      [user_id],
    );

    return res.status(200).json({
      status: true,
      address,
      message: "Address fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateAddress = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("dd", id);
    const { error, value } = addAddressSchema.validate(req.body || {});
    if (error) {
      const message = error.details[0].message.replace(/"/g, "");
      return res.status(400).json({
        status: false,
        message: message,
      });
    }
    let {
      name,
      email,
      phone,
      address,
      city,
      state,
      zip_code,
      country,
      is_default,
      user_id,
    } = value;

    const [existing] = await db.query("SELECT * FROM addresses WHERE id=?", [
      id,
    ]);
    if (existing == 0) {
      return res
        .status(400)
        .json({ status: false, message: "Address not found" });
    }
    const [user] = await db.query("SELECT * FROM users WHERE id = ?", [
      user_id,
    ]);
    if (!user.length) {
      return res.status(404).json({
        status: false,
        message: "User not found",
      });
    }

    await db.query(
      "UPDATE addresses SET name=? ,email=?, phone=?, address=?,city=?,state=?,zip_code=?,country=?,is_default=? WHERE id=?",
      [
        name,
        email,
        phone,
        address,
        city,
        state,
        zip_code,
        country,
        is_default,
        id,
      ],
    );
    return res.status(200).json({
      status: true,
      message: "Address update successfully",
    });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

const updateDefaultAddress = async (req, res) => {
  try {
    const { user_id, id, is_default } = req.body;
    const [existing] = await db.query(
      "SELECT * FROM addresses WHERE user_id = ? AND id =?",
      [user_id, id],
    );
    if (existing == 0) {
      res.status(404).json({
        status: false,
        message: "Address not found for this user",
      });
    }
    await db.query(
      "UPDATE addresses SET is_default = ? WHERE user_id = ? AND id != ?",
      [0, user_id, id],
    );
    await db.query(
      "UPDATE addresses SET is_default = ? WHERE id = ? AND user_id = ?",
      [is_default, id, user_id],
    );
    return res
      .status(200)
      .json({ status: true, message: "Address is default successfully" });
  } catch (error) {
    return res.status(500).json({
      status: false,
      message: error.message,
    });
  }
};

module.exports = {
  createAddress,
  getAddressByID,
  getAllAddressUser,
  updateAddress,
  updateDefaultAddress,
};
