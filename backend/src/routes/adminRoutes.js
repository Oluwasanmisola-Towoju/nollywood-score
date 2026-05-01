const router = require('express').Router();
const ctrl   = require('../controllers/adminController');
const { adminGuard } = require('../middleware/authGuard');

router.use(adminGuard); // all admin routes require admin token

router.get('/movies',          ctrl.listAllMovies);
router.patch('/movies/:id/approve', ctrl.approveMovie);
router.delete('/movies/:id',   ctrl.removeMovie);
router.get('/stats',           ctrl.getDashboardStats);

module.exports = router; 
