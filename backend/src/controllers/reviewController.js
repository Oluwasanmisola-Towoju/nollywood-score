const { prisma } = require('../../config/dbHandler');

const getReviewsForMovie = async (req, res, next) => {
    try {
        const reviews = await prisma.review.findMany({
            where: {
                movie_id: req.params.movieId
            },
            include: {
                user: {
                    select: {
                        username: true,
                        avatar_url: true
                    }
                }
            },
            orderBy: {
                created_at: 'desc'
            }
        });

        res
            .json({
                success: true,
                data: reviews
            });
    }
    catch (err) {
        next(err);
    }
};

const submitReview = async (req, res, next) => {
    try {
        const { movie_id, body } = req.body;

        if (!body || body.trim().length < 10) {
            return res
                .status(400)
                .json({
                    success: false,
                    error: 'Review must be at least 10 characters'
                });
        }

        const review = await prisma.review.create({
            data: {
                movie_id,
                body,
                user_id: req.user.id
            }
        });

        res
            .status(201)
            .json({
                success: true,
                data: review
            });
    }
    catch (err) {
        next(err);
    }
};

const deleteReview = async (req, res, next) => {
    try {
        const review = await prisma.review.findUnique({
            where: {
                id: req.params.id
            }
        });

        if (!review) {
            return res
                .status(404)
                .json({
                    success: false,
                    error: "Review not found"
                });
        }

        if (review.user_id !== req.user.id && !req.user.is_admin) {
            return res
                .status(403)
                .json({
                    success: false,
                    error: 'Not your review'
                });
        }

        // safe to delete
        await prisma.review.delete({
            where: {
                id: req.params.id
            }
        });

        res
            .json({
                success: true,
                message: 'Review Deleted'
            });
    }
    catch (err) {
        next(err);
    }
};

module.exports = { getReviewsForMovie, submitReview, deleteReview };