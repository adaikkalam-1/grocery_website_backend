const Joi = require("joi");

const addToCartSchema = Joi.object({
  productId: Joi.number().required(),
  quantity: Joi.number().optional().default(1),
  userId: Joi.number().required(),
});

const updateCartSchema = Joi.object({
  productId: Joi.number().required(),
  userId: Joi.number().required(),
  quantity: Joi.number().required(),
});

const getCartSchema = Joi.object({
  userId: Joi.number().required(),
});

const clearCartSchema = Joi.object({
  userId: Joi.number().required(),
});

module.exports = {
  addToCartSchema,
  updateCartSchema,
  getCartSchema,
  clearCartSchema,
};
