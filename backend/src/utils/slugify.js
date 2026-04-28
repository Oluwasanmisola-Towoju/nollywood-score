const slugify = (text) =>
  text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')  // replaces spaces and special characters with a hyphen
    .replace(/(^-|-$)/g, '');    // removes any hyphen at the very start or end

module.exports = { slugify };