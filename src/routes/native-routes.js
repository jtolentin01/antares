const router = require('express').Router();
const nativeInit = require('../controllers/native-controller');
router.get('/request', nativeInit);

module.exports = router;