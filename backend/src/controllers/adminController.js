const { prisma } = require('../../config/dbHandler');

const listAllMovies = async (req, res, next) => {
    try {
        const movies = await prisma.movie.findMany({
            orderBy: {
                created_at: 'desc'
            }
        });

        res
            .json({
                success: true,
                data: movies
            });
    }
    catch (err) {
        next(err);
    }
};

const approveMovie = async (req, res, next) => {
    try {
        const movie = await prisma.movie.update({
            where: {
                id: req.params.id,
            },
            data: {
                approved: true  // only updates the 'approves' boolean
            }
        });

        res
            .json({
                success: true,
                data: movie
            });
    }
    catch (err) {
        next(err);
    }
};

const removeMovie = async (req, res, next) => {
    try {
        await prisma.movie.delete({
            where: {
                id: req.params.id
            }
        });

        res.json({
            success: true,
            message: 'Movie Removed'
        });
    }
    catch (err) {
        next(err);
    }
};

const getDashboardStats = async (req, res, next) => {
    try {
        // Use promise.all to fire all queries simultaneously
        const [movies, users, ratings, reviews] = await Promise.all([
            prisma.movie.count(),
            prisma.user.count(),
            prisma.rating.count(),
            prisma.review.count()
        ]);

        res.json({
            success: true,
            data: {
                movies,
                users,
                ratings,
                reviews
            }
        });
    }
    catch (err) {
        next(err);
    }
};

module.exports = { listAllMovies, approveMovie, removeMovie, getDashboardStats };

