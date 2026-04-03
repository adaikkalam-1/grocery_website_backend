const Joi = require("joi");

const createProductSchema = Joi.object({
  product_name: Joi.string().required(),
  description: Joi.string().min(10).max(200).required(),
  original_price: Joi.number().required(),
  offer_price: Joi.number().required(),
  stock: Joi.number().required(),
  category_id: Joi.number().required(),
  image_url: Joi.string().required(),
  status: Joi.string().valid("active", "inactive").default("active"),
  sku: Joi.string().required(),
  is_featured: Joi.boolean().optional().default(false),
  is_trending: Joi.boolean().optional().default(false),
});

module.exports = {
  createProductSchema,
};
