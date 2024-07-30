const { asyncHandler } = require("../utils/errorHandle");
const { SuccessResponse } = require("../utils/responseHandle");
const PromoService = require("../services/promo.service");

const createNewPromo = asyncHandler(async (req, res, next) => {
  const {
    promo_code,
    promo_description,
    type,
    value,
    max_uses,
    start_date,
    end_date,
  } = req.body;

  new SuccessResponse({
    status: 201,
    message: "Promo created successfully!",
    data: await PromoService.createPromo({
      promo_code,
      promo_description,
      type,
      value,
      max_uses,
      start_date,
      end_date,
    }),
  }).json(res);
});

const updatePromo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    promo_code,
    promo_description,
    type,
    value,
    max_uses,
    start_date,
    end_date,
  } = req.body;

  new SuccessResponse({
    status: 200,
    message: "Promo updated successfully!",
    data: await PromoService.updatePromo(id, {
      promo_code,
      promo_description,
      type,
      value,
      max_uses,
      start_date,
      end_date,
    }),
  }).json(res);
});

const deletePromo = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  new SuccessResponse({
    status: 200,
    message: "Promo deleted successfully!",
    data: await PromoService.deletePromo(id),
  }).json(res);
});

module.exports = { createNewPromo, updatePromo, deletePromo };
