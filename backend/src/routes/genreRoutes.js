const router = require('express').Router();
const ctrl   = require('../controllers/genreController');

// Public Routes
router.get('/', ctrl.getAllGenres);

module.exports = router;