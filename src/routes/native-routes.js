const router = require('express').Router();
const nativeInit = require('../controllers/native-controller');
router.post('/request', nativeInit);

module.exports = router;