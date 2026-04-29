const router = require('express').Router();
const ctrl = require('../controllers/ratingController');
const { authGuard } = require('../middleware/authGuard');
const { ratingLimiter } = require('../middleware/rateLimiter');

// Public Routes
router.get('/movie/:movieId', ctrl.getRatingsForMovie);

// Protected routes
router.get('/user/me', authGuard, ctrl.getMyRatings);
router.post('/', authGuard, ratingLimiter, ctrl.submitRating);
router.delete('/:id', authGuard, ctrl.deleteRating);

module.exports = router;