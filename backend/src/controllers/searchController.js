const { prisma } = require('../../config/dbHandler');
const { paginate, paginatedResponse } = require('../utils/pagination');

const search = async (req, res, next) => {
    try {
        // Extract the search term "q" and any additional filters from the URL query
        // e.g GET /api/search?q=lionheart&genre=Drama&year=2018
        const { q, genre, year, platform, category } = req.query;
        const { page, limit, skip } = paginate(req.query);

        // Validate the primary search term and make sure its at least 2 characters
        if (!q || q.trim().length < 2) {
            return res
            .status(400)
            .json({
                success: false,
                error: 'Query must be at least 2 characters'
            });
        }

        // AND is used because the results must match the search term plus whatever filters the user applies
        const where = {
            AND: [
                // First condition makes sure 'q' must be found in at least one of the fields
                { 
                    OR: [
                        // OR is used cause someone search can either be a title, director or actor
                        {
                            title: {
                                contains: q,
                                mode: 'insensitive'
                            }
                        },
                        {
                            director: {
                                contains: q,
                                mode: 'insensitive'
                            }
                        },
                        {
                            genre: {
                                contains: q,
                                mode: 'insensitive'
                            }
                        },
                        {
                            // has is used instead of contains cause it checks for the exact string inside an array
                            cast: {has: q}
                        }
                    ]
                },

                // If any of the fields exist, it adds the firld to the AND array and if undefines it spreads an empty array which returns nothing
                ...(genre ? [{
                    genre: {
                        contains: genre,
                        mode: 'insensitive'
                    }
                }] : []),

                ...(year ? [{
                    year: parseInt(year)
                }] : []),

                ...(platform ? [{
                    streaming_platform: {
                        contains: platform,
                        mode: 'insensitive'
                    }
                }] : []),

                ...(category ? [{
                    category: category.toUpperCase()  // so as to mtch db ENUM exactly
                }] : [])
            ]
        };

        const [results, total] = await Promise.all([
            prisma.movie.findMany({
                where, // appky the filters
                skip,  // skip the previous pages
                take: limit,  // only take the limit set
                orderBy: {
                    avg_rating: 'desc' // show the highest rated match first
                }
            }),
            // This counts how many total movies match the search
            prisma.movie.count({ where })
        ]);

        // Send the perfectly formatted paginated response
        res.json(paginatedResponse(results, total, page, limit));
    }
    catch (err) {
        next(err);
    }
}

module.exports = { search };