// const validateRequest = require('./route_guard');

const initRoutes = ({ app }) => {
    app.use('/api/app/v1/native', require('./native-routes'));
    app.use((error, req, res, next) => 
        res.status(error.status || 500).json({
            message: error.message || 'API Route: Something Went Wrong'
        })
    );
};

module.exports = { initRoutes };