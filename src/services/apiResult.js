export const unwrapResult = (responseData, defaultMessage = 'Operacion completada') => {
  const payload = responseData ?? {};
  const isRawArray = Array.isArray(payload);
  const isRawObject = !isRawArray && typeof payload === 'object' && payload !== null;
  const hasWrapperKeys = isRawObject && (
    Object.prototype.hasOwnProperty.call(payload, 'data') ||
    Object.prototype.hasOwnProperty.call(payload, 'isSuccess') ||
    Object.prototype.hasOwnProperty.call(payload, 'success') ||
    Object.prototype.hasOwnProperty.call(payload, 'message')
  );

  // Support APIs that return raw arrays/objects instead of SimpleResults wrapper.
  if (isRawArray || (isRawObject && !hasWrapperKeys)) {
    return {
      data: payload,
      isSuccess: true,
      message: defaultMessage,
      errors: [],
      status: undefined,
      raw: payload,
    };
  }

  const isSuccess = payload.isSuccess ?? payload.success ?? true;

  if (!isSuccess) {
    const error = new Error(payload.message || 'Operacion fallida');
    error.payload = payload;
    throw error;
  }

  return {
    data: payload.data,
    isSuccess: true,
    message: payload.message || defaultMessage,
    errors: payload.errors || [],
    status: payload.status,
    raw: payload,
  };
};

export const extractData = (responseData, defaultValue = null) => {
  const result = unwrapResult(responseData);
  return result.data ?? defaultValue;
};
