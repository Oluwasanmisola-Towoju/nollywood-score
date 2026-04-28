const validate = (schema) => (req, res, next) => {
    const { error } = schema.validate(req.body, {
        abortEarly: false,  // ensure to check all fields before failing
    });

    // If validation fails ...
    if (error) {

        // Map through error details and get message(s)
        const messages = error.details.map(d => d.message);
        return res
        .status(400)
        .json({
            success: false,
            errors: messages
        });
    }

    next();
};

module.exports= { validate };
