const router = require('express').Router();
const ctrl = require('../controllers/searchController');

// Public Route
// e.g GET /api/search?q=lionheart&genre=Drama&year=2018
router.get('/', ctrl.search);

module.exports = router;