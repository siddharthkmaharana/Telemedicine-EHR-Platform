const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      // Parse and validate the request body
      schema.parse(req.body);
      next();
    } catch (error) {
      // Format Zod errors into a user-friendly structure
      const formattedErrors = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: formattedErrors
      });
    }
  };
};

module.exports = validateRequest;
