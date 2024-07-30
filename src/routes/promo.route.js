const express  = require('express')
const router = express.Router()
const PromoController = require('../controllers/promo.controller')

router.post('', PromoController.createNewPromo)
router.put('/:id', PromoController.updatePromo)
router.delete('/:id', PromoController.deletePromo)

module.exports = router