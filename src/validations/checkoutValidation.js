const Joi = require("joi");

const checkoutSchema = Joi.object({
  userId: Joi.number().required(),
  cartId: Joi.number().required(),
  addressId: Joi.number().allow(null),
  paymentMethod: Joi.string()
    .valid("COD", "PAYPAL", "GPAY")
    .default("COD")
    .required(),
});

module.exports = {
  checkoutSchema,
};
