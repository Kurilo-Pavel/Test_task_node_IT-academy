const validation = (params) => {
  let errors = [];
  if (params.url.trim().length <= 10) {
    errors.push({url: "error"});
  }


  if (params.parameters.length > 0) {
    params.parameters.forEach(item => {
      if (item.key.trim().length === 0 || item.value.trim().length === 0) {
        if (errors.some(error => error.parameters)) {
          errors.forEach(error => {
            if (error.parameters) {
              error.parameters.push({id: item.id, key: !!item.key.trim(), value: !!item.value.trim()});
            }
          });
        } else {
          errors.push({parameters: [{id: item.id, key: !!item.key.trim(), value: !!item.value.trim()}]})
        }
      }
    });
  }

  if (params.headers.length > 0) {
    params.headers.forEach(head => {
      if (head.key.trim().length === 0 || head.value.trim().length === 0) {
        if (errors.some(error => error.headers)) {
          errors.forEach(error => {
            if (error.headers) {
              error.headers.push({id: head.id, key: !!head.key.trim(), value: !!head.value.trim()});
            }
          });
        } else {
          errors.push({headers: [{id: head.id, key: !!head.key.trim(), value: !!head.value.trim()}]})
        }
      }
    });
  }
  return errors;
};
export {validation};