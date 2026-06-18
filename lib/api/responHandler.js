const responseError = function (values, res){
  let errors = [];
    for (const value of values) {
      errors.push((`${value.path[0]} is ${value.message}`).toLowerCase())
    }
    let firstError = null
    if (values.length > 0) {
      firstError = (`${values[0].path[0]} is ${values[0].message}`).toLowerCase().toString()
      
    }
    let data = {
      status: 503,
      success: false,
      message: firstError,
      errors: errors
    };
    return res.status(503).json(data);
  }
  const responseData = function (statusCode, values, res) {
      let bool = false;
      if (statusCode == 200) {
        bool = true;
      }
      let data = {
        status: statusCode,
        success: bool,
        data: values
      };
      return res.status(statusCode).json(data);
    };
    
    const responseMessage = function (statusCode, message, res) {
      let bool = false;
      if (statusCode == 200) {
        bool = true;
      }
      let data = {
        status: statusCode,
        success: bool,
        message: message,
        errors:[]
      };
      if (statusCode == 200) {
        delete data.errors
      }
      return res.status(statusCode).json(data);
    };
    
    module.exports = { responseData, responseMessage, responseError };