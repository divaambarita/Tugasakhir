const nullObjectRemover = function (object){
    for (const key in object) {
        if (object[key] === null || object[key] === undefined) {
            delete object[key];
        }
    }
    return object
}

module.exports = { nullObjectRemover };