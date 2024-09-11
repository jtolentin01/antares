const router = require('express').Router();
const nativeInit = require('../controllers/native-controller');
const nativeOneInit = require('../controllers/native-one-controller');
router.post('/request', nativeInit);
router.post('/request/one', nativeOneInit);

module.exports = router;