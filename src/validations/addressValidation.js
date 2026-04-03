const Joi = require("joi");

const addAddressSchema = Joi.object({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  phone: Joi.string()
    .length(10)
    .pattern(/^[0-9]+$/)
    .required(),
  user_id: Joi.number().required(),
  address: Joi.string().required(),
  city: Joi.string().required(),
  state: Joi.string().required(),
  zip_code: Joi.string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .required(),
  country: Joi.string().required(),
  is_default: Joi.number().default(0),
});
module.exports = {
  addAddressSchema,
};
