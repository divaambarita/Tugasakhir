const getDateTimeNow = function () {
    const date = new Date().toISOString()
    return date.toString()
};

module.exports = { getDateTimeNow };
