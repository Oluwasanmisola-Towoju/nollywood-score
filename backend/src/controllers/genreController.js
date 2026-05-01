const { prisma } = require('../../config/dbHandler');

const getAllGenres = async (req, res, next) => {
  try {
    const genres = await prisma.movie.findMany({
      select: { genre: true },
      distinct: ['genre'], // ensures that only the genre selected appears once in the final array 
      orderBy: { genre: 'asc' } // sort alphabetically
    });
    res.json({
        success: true,
        data: genres.map(g => g.genre)  // whatever prisma returns map flattens it to an array of strings
    });
  }
  catch (err) {
    next(err); 
  }
};

module.exports = { getAllGenres };