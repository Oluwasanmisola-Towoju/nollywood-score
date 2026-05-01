const router = require('express').Router();
const ctrl = require('../controllers/reviewController');
const { authGuard } = require('../middleware/authGuard');

// Public Routes
router.get('/movie/:movieId', ctrl.getReviewsForMovie);

// Private Routes
router.post('/', authGuard, ctrl.submitReview);
router.delete('/:id', authGuard, ctrl.deleteReview);

module.exports = router;