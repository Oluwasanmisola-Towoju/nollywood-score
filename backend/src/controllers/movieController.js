const { prisma } = require('../../config/dbHandler');
const {paginate, paginateResponse } = require('../utils/pagination');
const { slugify } = require('../utils/slugify');

const getAllMovies = async (req, res, next) => {
    try{
        // Extract pagination data
        const { page, limit, skip } = paginate(req.query);

        // Extract search filters from URL query
        const {genre, year, platform } = req.query;

        // Build search query with optional filters dynamically
        const where = {
            ...(genre  &&  {
                genre: {
                    contains: genre,
                    mode: 'insensitive'
                }
            }),
            ...(year && {
                year: parseInt(year)
            }),
            ...(platform  && {
                streaming_platform: {
                    contains: platform,
                    mode: 'insensitive'
                }
            })
        };
        
        // Run both queries simultaneously 
        const [movies, total] = await Promise.all([
            prisma.movie.findMany({
                where,
                skip,
                take: limit,
                orderBy: {avg_rating: 'desc'} // show best movies first
            }),
            prisma.movie.count({ where })
        ]);

        // Send paginated data back to the user
        res.json(paginateResponse(movies, total, page, limit));
    }
    catch (err) {
        next(err);
    }
};

const getMovieBySlug = async (req, res, next) => {
    try{
        const movie = await prisma.movie.findUnique({
            where: {
                slug: req.params.slug
            },
            include: {  // join related tables to get movie's reviews
                reviews: { // join user table to getthe reviewer info
                    include: {
                        user: {
                            select: {
                                username: true,
                                avatar_url: true
                            }
                        }
                    },
                    orderBy: {
                        created_at: 'desc',
                    },
                    take: 10
                }
            }
        });

        if (!movie) {
            return res
            .status(404)
            .json({
                success: false,
                error: 'Movie not found'
            });
        }

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

const getTrending = async (req, res, next) => {
    try{
        const movies = await prisma.movie.findMany({
            // only consider movies with at least 3 ratings 
            where: {
                rating_count: {
                    gte: 3
                }
            },
            // sort by best rated movies first
            orderBy: [{
                avg_rating: 'desc',
            },
            { // then by most ratings...
               rating_count: 'desc' 
            }],
            take: 10
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
}

const getByCategory = async (req, res, next) => {
    try{
        // make parameter match enum in db correctly
        const cat = req.params.cat.toUpperCase();
        const { page, limit, skip } = paginate(req.query);
        const [movies, total] = await Promise.all([
            prisma.movie.findMany({
                where: {
                    category: cat
                },
                skip,
                take: limit,
                orderBy: { year: 'desc'}
            }),
            prisma.movie.count({
                where: {
                    category: cat
                }
            })
        ]);

        res
        .json(paginateResponse(movies, total, page, limit));
    }
    catch (err) {
        next(err);
    }
}

const createMovie = async (req, res, next) => {
    try{
        const { title, year, director, cast, genre, poster_url, streaming_platform, synopsis } = req.body;
        const movie = await prisma.movie.create({
            data: {
                title,
                year,
                director,
                cast,
                genre,
                poster_url,
                streaming_platform,
                synopsis,
                slug: slugify(title),
                category: year < 2010 ? 'OLD_NOLLYWOOD' : 'NEW_NOLLYWOOD'
            }
        });

        res
        .status(201)
        .json({
            success: true,
            data: movie
        });
    }
    catch (err) {
        next(err);
    }
};

const updateMovie = async (req, res, next) => {
    try{
        const movie = await prisma.movie.update({
            where: {
                id: parseInt(req.params.id),
            },
            data: req.body
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

const deleteMovie = async (req, res, next) => {
    try{
        await prisma.movie.delete({
            where: {
                id: parseInt(req.params.id)
            }
        });

        res
        .json({
            success: true,
            message: 'Movie deleted'
        });
    }
    catch (err) {
        next(err);
    }
};

module.exports = { getAllMovies, getMovieBySlug, getTrending, getByCategory, createMovie, updateMovie, deleteMovie };