const router = require('express').Router();
const ctrl = require('../controllers/movieController');
const { authGuard } = require('../middleware/authGuard');

// Public Routes
router.get('/', ctrl.getAllMovies);
router.get('/trending', ctrl.getTrending);
router.get('/category/:cat', ctrl.getByCategory);
router.get('/:slug', ctrl.getMovieBySlug);

// Private Routes
router.post('/', authGuard, ctrl.createMovie);
router.patch('/:id', authGuard, ctrl.updateMovie);
router.delete('/:id', authGuard, ctrl.deleteMovie);

module.exports = router;