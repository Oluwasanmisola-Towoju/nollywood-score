const paginate = (query) => {
    const page = Math.max(1, parseInt(query.page) || 1);
    const limit = Math.min(50, parseInt(query.limit) || 20);
    const skip = (page - 1) * limit;

    return { page, limit, skip };
};

const paginateResponse = (data, total, page, limit) => ({
    success: true,
    data,
    meta: {
        total,
        page, 
        limit,
        total_pages: Math.ceil(total/limit),
        has_next: page * limit < total,
        has_prev: page > 1
    }
});

module.exports = { paginate, paginateResponse };