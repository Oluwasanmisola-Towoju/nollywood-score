const { prisma } = require('../../config/dbHandler');
const { bayesianAverage } = require('../utils/ratingCalculator');

const submitRating = async (req, res, next) => {
    try{
        const { movie_id, score } =  req.body;
        const user_id = req.user.id;

        if (score < 1 || score > 10) {
            return res
            .status(400)
            .json({
                success: false,
                error: 'Score must be between 1 and 10'
            });
        } 

        // Update if user already rated the movie, create if they haven't 
        const rating = await prisma.rating.upsert({
            where: {
                movie_id_user_id: {
                    movie_id,
                    user_id
                }
            },
            update: { score },
            create: { movie_id, user_id, score}
        });

        // Recalculate movie average
        const { _avg, _count } = await prisma.rating.aggregate({
            where: { movie_id },
            _avg: { score: true },
            _count: { score: true }
        });

        // Pass the raw numbers through Bayesian formula
        const newAvg = bayesianAverage(_avg.score || 0, _count.score);

        // Save the new calculated average to the Movie table
        await prisma.movie.update({
            where: { id: movie_id },
            data: {
                avg_rating: newAvg,
                rating_count: _count.score
            }
        });

        res.json({
            success: true,
            data: rating, 
            new_average: parseFloat(newAvg.toFixed(2))
        });
    }
    catch (err) {
        next(err);
    }
};

const getRatingsForMovie = async (req, res, next) => {
    try{
        const { _avg, _count } = await prisma.rating.aggregate({
            where: { movie_id: parseInt(req.params.movieId) },
            _avg: { score: true },
            _count: { score: true }            
        });

        res
        .json({
            success: true,
            data: {
                avg: _avg.score || 0, // fallback to 0 if they're no ratings
                count: _count.score
            }
        });
    }
    catch (err) {
        next(err);
    }
};

const getMyRatings = async (req, res, next) => {
    try{
        const ratings = await prisma.rating.findMany({
            where: { user_id: parseInt(req.user.id) },
            include: {
                movie: {
                    select: {
                        title: true,
                        slug: true,
                        poster_url: true
                    }
                }
            }
        });

        res
        .json({
            success: true,
            data: ratings
        });
    }
    catch (err) {
        next(err);
    }
};

const deleteRating = async (req, res, next) => {
    try{
        const ratingId = parseInt(req.params.id);
        const userId = parseInt(req.user.id);

        // First find the rating  to see who owns it
        const rating = await prisma.rating.findUnique({
            where: {
                id: ratingId
            }
        });

        if (!rating) {
            return res
            .status(404)
            .json({
                success: false,
                error: 'Rating not found'
            });
        }

        // Check if the logged in user is the owner (or an admin)
        if(rating.user_id !== userId && !req.user.is_admin) {
            return res
            .status(403)
            .json({
                success: false,
                error: 'You can only delete your own ratings'
            })
        } 
        
        // Safe to delete Now
        await prisma.rating.delete({
            where: { id: ratingId }
        });

        // recalculate movie average here since deleting changes the rating's maths..
        const { _avg, _count } = await prisma.rating.aggregate({
            where: { movie_id: rating.movie_id },
            _avg: { score: true },
            _count: { score: true }
        });

        // pass the raw numbers through Bayesian formula
        const newAvg = bayesianAverage(_avg.score || 0, _count.score);

        // save the newly recalculated average back to the movie table
        await prisma.movie.update({
            where: {
                id: rating.movie_id,
            },
            data: {
                avg_rating: newAvg,
                rating_count: _count.score
            }
        });

        res
        .json({
            success: true,
            message: "Rating Removed",
            new_average: parseFloat(newAvg.toFixed(2)) // Send the updated average back to frontend
        });
    }
    catch (err) {
        next(err);
    }
};

module.exports = { submitRating, getRatingsForMovie,  getMyRatings, deleteRating };