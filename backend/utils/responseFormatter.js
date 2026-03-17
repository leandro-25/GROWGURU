class ResponseFormatter {
  static success(data, meta = null) {
    return {
      success: true,
      data,
      ...(meta && { meta })
    };
  }

  static paginated(data, pagination) {
    return {
      success: true,
      data,
      pagination
    };
  }

  static error(code, message, details = null) {
    const response = {
      success: false,
      error: {
        code,
        message
      }
    };
    
    if (details) {
      response.error.details = details;
    }
    
    return response;
  }

  static created(data) {
    return {
      success: true,
      message: 'Criado com sucesso',
      data
    };
  }

  static updated(data) {
    return {
      success: true,
      message: 'Atualizado com sucesso',
      data
    };
  }

  static deleted() {
    return {
      success: true,
      message: 'Excluído com sucesso'
    };
  }
}

module.exports = ResponseFormatter;
