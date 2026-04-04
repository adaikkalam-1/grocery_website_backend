const Joi = require("joi");

const checkoutSchema = Joi.object({
  userId: Joi.number().required(),
  cartId: Joi.number().required(),
  addressId: Joi.number().allow(null),
  payment_method: Joi.string()
    .valid("cod", "paypal", "gpay")
    .default("cod")
    .required(),
});

module.exports = {
  checkoutSchema,
};
