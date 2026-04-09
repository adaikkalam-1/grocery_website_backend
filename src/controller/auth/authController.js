const db = require("../../../config/dbConfig");
const { generateToken } = require("../../utils/common");
const {
  loginSchema,
  registerSchema,
} = require("../../validations/authValidation");
const bcrypt = require("bcrypt");
require("dotenv").config();

const login = async (req, res) => {
  const { error, value } = loginSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      message: error.details[0].message,
    });
  }
  const { email, password } = value;

  try {
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (rows.length == 0) {
      return res.status(404).json({ message: "Invalid email" });
    }
    const user = rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid password" });
    }

    // const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    //   expiresIn: "7d",
    // });
    const token = generateToken(user);

    console.log("user", user);
    const { password: userPassword, ...rest } = user;
    const newData = {
      ...rest,
      token: token,
    };

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false,
    //   sameSite: "lax",
    //   path: "/",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // });
    return res.status(200).json({ message: "Login successful", data: newData });
  } catch (error) {
    return res.status(500).json({ status: false, error: error });
  }
};

const register = async (req, res) => {
  try {
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        message: error.details[0].message,
      });
    }

    const { email, password, name, status, role } = value;
    const [existing] = await db.query("SELECT * FROM  users WHERE email = ?", [
      email,
    ]);
    if (existing.length > 0) {
      return res.status(400).json({ message: "Email already exists" });
    }
    const hash = bcrypt.hashSync(password, 10);

    const [result] = await db.query(
      "INSERT INTO  users (name,email,password,status,role) VALUES (?,?,?,?,?)",
      [name, email, hash, status, role],
    );

    return res.status(201).json({
      status: true,
      message: "Registered successfully",
    });
  } catch (error) {
    return res.status(500).json({ status: false, message: error.message });
  }
};

module.exports = {
  login,
  register,
};
