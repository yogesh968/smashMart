const express = require('express');
const router = express.Router();
const a = require('../controllers/addressController');
const auth = require('../middleware/auth');

router.get('/', auth, a.getAddresses);
router.post('/', auth, a.addAddress);
router.put('/:id', auth, a.updateAddress);
router.delete('/:id', auth, a.deleteAddress);
router.patch('/:id/default', auth, a.setDefault);

module.exports = router;
