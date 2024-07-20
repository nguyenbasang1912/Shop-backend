const { cleanObject } = require("../utils")
const Promo = require('../models/promo.model')

const createPromo = async (body) => {
  const promo = body

  return await Promo.create(promo)
}

const updatePromo = async (id, body) => {
  const promo = await Promo.findByIdAndUpdate(id, cleanObject(body), { new: true })
  return promo
}

const deletePromo = async (id) => {
  const promo = await Promo.findByIdAndUpdate(id, {
    is_active: false,
    is_deleted: true,
  })
  return promo
}

module.exports = {
  createPromo,
  updatePromo,
  deletePromo,
}