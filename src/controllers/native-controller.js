const nativeInit = () => {
    try {
        res.status(200).json({ message: 'Controller Accessed!' });
    } catch (error) {
        next(error);
    }
}
module.exports = nativeInit;