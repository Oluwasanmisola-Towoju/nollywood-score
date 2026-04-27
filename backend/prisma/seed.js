require('dotenv/config');
const { prisma, disconnectDB } = require('../config/dbHandler');
const movies = require('../../database/seeds/movies.json');

function slugify(title) {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-') // replaces spaces and special characters with a hyphen
        .replace(/(^-|-$)/g, '');    // removes any hyphen at the very start or end
}

async function main() {
    console.log("Seeding movies...");

    for (const movie of movies) {
        await prisma.movie.upsert({
            where: {
                slug: slugify(movie.title)
            },
            update: {},
            create: {
                title: movie.title,
                slug: slugify(movie.title),
                year: movie.year,
                director: movie.director,
                cast: movie.cast,
                genre: movie.genre,
                poster_url: movie.poster_url,
                streaming_platform: movie.streaming_platform,
                category: movie.year < 2010 ? 'OLD_NOLLYWOOD' : "NEW_NOLLYWOOD"
            }
        });
    }
    console.log(`Done - All ${movies.length} movies seeded`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await disconnectDB();
    });