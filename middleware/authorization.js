exports.authorization = (isAdmin) => {
    return (req, res, next) => {
        if (!req.userId) {
            return res.status(401).send({ status: "User not found" });
        }
        const isadmin = req.role;
        if (isAdmin !== isadmin) {
            return res.status(403).send({ status: "Unauthorized!" });
        }
        next();
    };
};