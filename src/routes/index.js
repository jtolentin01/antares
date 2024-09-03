// const validateRequest = require('./route_guard');

const initRoutes = ({ app }) => {
    app.use('/api/v1/tools', validateRequest, require('./tools_routes'));
    app.use('/api/v1/batch', validateRequest, require('./batch_routes'));
    app.use('/api/v1/users', validateRequest, require('./users_routes'));
    app.use('/api/v1/root', validateRequest, require('./root_routes'));
    app.use('/api/v1/analytics', validateRequest, require('./analytics_routes'));
    app.use('/api/v1/auth', require('./auth_routes'));
    app.use('/api/v1/creation/user', require('./users_routes'));
    app.use('/api/v1/public', require('./public_routes'));
    app.use((error, req, res, next) => 
        res.status(error.status || 500).json({
            message: error.message || 'API Route: Something Went Wrong'
        })
    );
};

module.exports = { initRoutes };