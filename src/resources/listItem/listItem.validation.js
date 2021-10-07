const Joi = require('joi');

exports.createOne = Joi.object({
  description: Joi.string()
    .max(50)
    .required(),
  links: Joi.array()
    .items(
      Joi.string()
        .max(255)
    )
    .max(10),
  listId: Joi.number()
    .integer()
    .positive()
    .max(4294967295)
    .required()
}).options({
  abortEarly: true,
  stripUnknown: true,
})


exports.check = Joi.object({
  listRef: Joi.string()
    .max(30)
    .required(),
  listItemId: Joi.number()
    .integer()
    .positive()
    .max(4294967295)
    .required()
}).options({
  abortEarly: true,
  stripUnknown: true,
})

exports.deleteItem = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .max(4294967295)
    .required()
}).options({
  abortEarly: true,
  stripUnknown: true,
})


exports.uncheck = Joi.object({
  id: Joi.number()
    .integer()
    .positive()
    .max(4294967295)
    .required()
}).options({
  abortEarly: true,
  stripUnknown: true,
})