const Joi = require("joi");

const categoriesSchema = Joi.object({
  category_name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(2).max(200).required(),

  status: Joi.string().valid("active", "inactive").default("active"),

  category_slug: Joi.string()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
  image_url: Joi.string().required(),
});

const upCategoriesSchema = Joi.object({
  id: Joi.number().required(),

  category_name: Joi.string().min(3).max(100).required(),
  description: Joi.string().min(2).max(200).required(),

  status: Joi.string().valid("active", "inactive").default("active"),

  category_slug: Joi.string()
    .lowercase()
    .pattern(/^[a-z0-9-]+$/)
    .required()
    .messages({
      "string.pattern.base":
        "Slug must contain only lowercase letters, numbers, and hyphens",
    }),
  image_url: Joi.string().required(),
});

const updateCategoryStatusSchema = Joi.object({
  status: Joi.string().valid("active", "inactive").required(),
});

module.exports = {
  categoriesSchema,
  upCategoriesSchema,
  updateCategoryStatusSchema,
};
