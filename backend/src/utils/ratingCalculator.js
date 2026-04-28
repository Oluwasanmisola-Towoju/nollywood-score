// Bayesian average — prevents a single 10/10 rating making a movie #1
const BAYESIAN_M = 5;   // minimum ratings required
const BAYESIAN_C = 5.0; // assumed average for new movies

const bayesianAverage = (avg, count) => {
  return ((BAYESIAN_M * BAYESIAN_C) + (avg * count)) / (BAYESIAN_M + count);
};

module.exports = { bayesianAverage };