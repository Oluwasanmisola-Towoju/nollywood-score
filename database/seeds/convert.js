const fs = require('fs');
const csv = require('csv-parse/sync');

const raw = fs.readFileSync('./movies.csv', 'utf-8');
const records = csv.parse(raw, {
    columns: true,
    skip_empty_lines: true
});

const movies = records.map(row => ({
    title: row.Title?.trim(),
    year: parseInt(row.Year),
    director: row.Director?.trim(),
    cast: row.Cast?.split(',').map(s => s.trim()),
    genre: row.Genre?.trim(),
    poster_url: row['Poster URL']?.trim(),
    streaming_platform: row['Streaming Platform']?.trim(),
    category: parseInt(row.Year) < 2010 ? 'old_nollywood' : 'new_nollywood'
}));

fs.writeFileSync('./movies.json', JSON.stringify(movies, null, 2));
console.log(`Converted ${movies.length} movies to JSON`);