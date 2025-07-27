// Basic validation rules
export const required = (value, fieldName = 'This field') => {
  if (!value || (typeof value === 'string' && value.trim().length === 0)) {
    return `${fieldName} is required`;
  }
  return null;
};

export const minLength = (value, min, fieldName = 'This field') => {
  if (value && value.length < min) {
    return `${fieldName} must be at least ${min} characters long`;
  }
  return null;
};

export const maxLength = (value, max, fieldName = 'This field') => {
  if (value && value.length > max) {
    return `${fieldName} must not exceed ${max} characters`;
  }
  return null;
};

export const minValue = (value, min, fieldName = 'This field') => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && numValue < min) {
    return `${fieldName} must be at least ${min}`;
  }
  return null;
};

export const maxValue = (value, max, fieldName = 'This field') => {
  const numValue = parseFloat(value);
  if (!isNaN(numValue) && numValue > max) {
    return `${fieldName} must not exceed ${max}`;
  }
  return null;
};

// Email validation
export const email = (value) => {
  if (!value) return null;
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(value)) {
    return 'Please enter a valid email address';
  }
  return null;
};

// Phone validation (Indian numbers)
export const phone = (value) => {
  if (!value) return null;
  
  const cleanPhone = value.replace(/[\s-+()]/g, '');
  
  // Check for 10-digit number starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  if (phoneRegex.test(cleanPhone)) return null;
  
  // Check for number with country code (+91)
  const withCountryCode = /^(\+91|91)?[6-9]\d{9}$/;
  if (withCountryCode.test(cleanPhone)) return null;
  
  return 'Please enter a valid Indian phone number';
};

// Password validation
export const password = (value) => {
  if (!value) return null;
  
  const errors = [];
  
  if (value.length < 8) {
    errors.push('at least 8 characters');
  }
  
  if (!/(?=.*[a-z])/.test(value)) {
    errors.push('one lowercase letter');
  }
  
  if (!/(?=.*[A-Z])/.test(value)) {
    errors.push('one uppercase letter');
  }
  
  if (!/(?=.*\d)/.test(value)) {
    errors.push('one number');
  }
  
  if (!/(?=.*[@$!%*?&])/.test(value)) {
    errors.push('one special character');
  }
  
  if (errors.length > 0) {
    return `Password must contain ${errors.join(', ')}`;
  }
  
  return null;
};

// Confirm password validation
export const confirmPassword = (value, originalPassword) => {
  if (!value) return null;
  
  if (value !== originalPassword) {
    return 'Passwords do not match';
  }
  
  return null;
};

// URL validation
export const url = (value) => {
  if (!value) return null;
  
  try {
    new URL(value);
    return null;
  } catch {
    return 'Please enter a valid URL';
  }
};

// Number validation
export const number = (value, fieldName = 'This field') => {
  if (!value) return null;
  
  if (isNaN(value) || isNaN(parseFloat(value))) {
    return `${fieldName} must be a valid number`;
  }
  
  return null;
};

export const positiveNumber = (value, fieldName = 'This field') => {
  const numError = number(value, fieldName);
  if (numError) return numError;
  
  if (parseFloat(value) <= 0) {
    return `${fieldName} must be a positive number`;
  }
  
  return null;
};

export const integer = (value, fieldName = 'This field') => {
  if (!value) return null;
  
  if (!Number.isInteger(Number(value))) {
    return `${fieldName} must be a whole number`;
  }
  
  return null;
};

// Date validation
export const date = (value, fieldName = 'This field') => {
  if (!value) return null;
  
  const dateValue = new Date(value);
  if (isNaN(dateValue.getTime())) {
    return `${fieldName} must be a valid date`;
  }
  
  return null;
};

export const futureDate = (value, fieldName = 'This field') => {
  const dateError = date(value, fieldName);
  if (dateError) return dateError;
  
  const dateValue = new Date(value);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (dateValue <= today) {
    return `${fieldName} must be a future date`;
  }
  
  return null;
};

export const pastDate = (value, fieldName = 'This field') => {
  const dateError = date(value, fieldName);
  if (dateError) return dateError;
  
  const dateValue = new Date(value);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  
  if (dateValue >= today) {
    return `${fieldName} must be a past date`;
  }
  
  return null;
};

// Indian-specific validations
export const pincode = (value) => {
  if (!value) return null;
  
  const pincodeRegex = /^[1-9][0-9]{5}$/;
  if (!pincodeRegex.test(value)) {
    return 'Please enter a valid 6-digit pincode';
  }
  
  return null;
};

export const gstin = (value) => {
  if (!value) return null;
  
  // GSTIN format: 2 digits (state code) + 10 characters (PAN) + 1 digit (entity number) + 1 character (Z) + 1 check digit
  const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  
  if (!gstinRegex.test(value.toUpperCase())) {
    return 'Please enter a valid GSTIN';
  }
  
  return null;
};

export const pan = (value) => {
  if (!value) return null;
  
  // PAN format: 5 letters + 4 digits + 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  
  if (!panRegex.test(value.toUpperCase())) {
    return 'Please enter a valid PAN number';
  }
  
  return null;
};

// RasoiLink-specific validations
export const productName = (value) => {
  const requiredError = required(value, 'Product name');
  if (requiredError) return requiredError;
  
  const lengthError = minLength(value, 2, 'Product name');
  if (lengthError) return lengthError;
  
  const maxLengthError = maxLength(value, 100, 'Product name');
  if (maxLengthError) return maxLengthError;
  
  // Check for valid characters (letters, numbers, spaces, common symbols)
  const validCharsRegex = /^[a-zA-Z0-9\s\-&().,]+$/;
  if (!validCharsRegex.test(value)) {
    return 'Product name contains invalid characters';
  }
  
  return null;
};

export const productPrice = (value) => {
  const requiredError = required(value, 'Price');
  if (requiredError) return requiredError;
  
  const numberError = positiveNumber(value, 'Price');
  if (numberError) return numberError;
  
  const price = parseFloat(value);
  if (price > 10000) {
    return 'Price seems too high. Please verify';
  }
  
  if (price < 0.01) {
    return 'Price must be at least ₹0.01';
  }
  
  return null;
};

export const productQuantity = (value) => {
  const requiredError = required(value, 'Quantity');
  if (requiredError) return requiredError;
  
  const numberError = positiveNumber(value, 'Quantity');
  if (numberError) return numberError;
  
  const integerError = integer(value, 'Quantity');
  if (integerError) return integerError;
  
  const quantity = parseInt(value);
  if (quantity > 10000) {
    return 'Quantity seems too high. Please verify';
  }
  
  return null;
};

export const deliveryAddress = (value) => {
  const requiredError = required(value, 'Delivery address');
  if (requiredError) return requiredError;
  
  const lengthError = minLength(value, 10, 'Delivery address');
  if (lengthError) return lengthError;
  
  const maxLengthError = maxLength(value, 500, 'Delivery address');
  if (maxLengthError) return maxLengthError;
  
  return null;
};

// Composite validation functions
export const validateLoginForm = (formData) => {
  const errors = {};
  
  const emailError = email(formData.email);
  if (emailError) errors.email = emailError;
  
  const passwordError = required(formData.password, 'Password');
  if (passwordError) errors.password = passwordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateRegistrationForm = (formData) => {
  const errors = {};
  
  const nameError = required(formData.name, 'Name');
  if (nameError) errors.name = nameError;
  else {
    const nameMinError = minLength(formData.name, 2, 'Name');
    if (nameMinError) errors.name = nameMinError;
  }
  
  const emailError = email(formData.email);
  if (emailError) errors.email = emailError;
  
  const phoneError = phone(formData.phone);
  if (phoneError) errors.phone = phoneError;
  
  const passwordError = password(formData.password);
  if (passwordError) errors.password = passwordError;
  
  const confirmPasswordError = confirmPassword(formData.confirmPassword, formData.password);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateProductForm = (formData) => {
  const errors = {};
  
  const nameError = productName(formData.name);
  if (nameError) errors.name = nameError;
  
  const priceError = productPrice(formData.price);
  if (priceError) errors.price = priceError;
  
  const quantityError = productQuantity(formData.quantity);
  if (quantityError) errors.quantity = quantityError;
  
  const categoryError = required(formData.category, 'Category');
  if (categoryError) errors.category = categoryError;
  
  const unitError = required(formData.unit, 'Unit');
  if (unitError) errors.unit = unitError;
  
  if (formData.description) {
    const descMaxError = maxLength(formData.description, 1000, 'Description');
    if (descMaxError) errors.description = descMaxError;
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateOrderForm = (formData) => {
  const errors = {};
  
  if (!formData.items || formData.items.length === 0) {
    errors.items = 'At least one item is required';
  } else {
    // Validate each item
    formData.items.forEach((item, index) => {
      if (!item.product_id) {
        errors[`item_${index}_product`] = 'Product is required';
      }
      
      if (!item.quantity || item.quantity <= 0) {
        errors[`item_${index}_quantity`] = 'Valid quantity is required';
      }
    });
  }
  
  const addressError = deliveryAddress(formData.delivery_address);
  if (addressError) errors.delivery_address = addressError;
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Generic form validator
export const validateForm = (formData, validationRules) => {
  const errors = {};
  
  Object.keys(validationRules).forEach(field => {
    const rules = Array.isArray(validationRules[field]) ? validationRules[field] : [validationRules[field]];
    const value = formData[field];
    
    for (const rule of rules) {
      let error = null;
      
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object') {
        const { validator, message, ...params } = rule;
        if (typeof validator === 'function') {
          error = validator(value, ...Object.values(params));
          if (error && message) {
            error = message;
          }
        }
      }
      
      if (error) {
        errors[field] = error;
        break; // Stop at first error for this field
      }
    }
  });
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Validation rule builders
export const rules = {
  required: (fieldName) => (value) => required(value, fieldName),
  minLength: (min, fieldName) => (value) => minLength(value, min, fieldName),
  maxLength: (max, fieldName) => (value) => maxLength(value, max, fieldName),
  minValue: (min, fieldName) => (value) => minValue(value, min, fieldName),
  maxValue: (max, fieldName) => (value) => maxValue(value, max, fieldName),
  email: () => email,
  phone: () => phone,
  password: () => password,
  number: (fieldName) => (value) => number(value, fieldName),
  positiveNumber: (fieldName) => (value) => positiveNumber(value, fieldName),
  integer: (fieldName) => (value) => integer(value, fieldName),
  url: () => url,
  date: (fieldName) => (value) => date(value, fieldName),
  futureDate: (fieldName) => (value) => futureDate(value, fieldName),
  pastDate: (fieldName) => (value) => pastDate(value, fieldName),
  pincode: () => pincode,
  gstin: () => gstin,
  pan: () => pan,
  productName: () => productName,
  productPrice: () => productPrice,
  productQuantity: () => productQuantity,
  deliveryAddress: () => deliveryAddress,
  
  // Custom rule builder
  custom: (validator, message) => (value) => {
    const isValid = validator(value);
    return isValid ? null : message;
  },
  
  // Conditional validation
  when: (condition, rule) => (value, formData) => {
    if (condition(formData)) {
      return typeof rule === 'function' ? rule(value) : rule;
    }
    return null;
  }
};

// Real-time validation hook helper
export const useFormValidation = (initialData, validationRules) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  
  const validateField = (fieldName, value) => {
    const fieldRules = validationRules[fieldName];
    if (!fieldRules) return null;
    
    const rules = Array.isArray(fieldRules) ? fieldRules : [fieldRules];
    
    for (const rule of rules) {
      let error = null;
      
      if (typeof rule === 'function') {
        error = rule(value);
      } else if (typeof rule === 'object') {
        const { validator, message, ...params } = rule;
        if (typeof validator === 'function') {
          error = validator(value, ...Object.values(params));
          if (error && message) {
            error = message;
          }
        }
      }
      
      if (error) {
        return error;
      }
    }
    
    return null;
  };
  
  const handleChange = (fieldName, value) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
    
    // Validate field if it has been touched
    if (touched[fieldName]) {
      const error = validateField(fieldName, value);
      setErrors(prev => ({
        ...prev,
        [fieldName]: error
      }));
    }
  };
  
  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    
    const error = validateField(fieldName, formData[fieldName]);
    setErrors(prev => ({
      ...prev,
      [fieldName]: error
    }));
  };
  
  const validateAll = () => {
    const validation = validateForm(formData, validationRules);
    setErrors(validation.errors);
    
    // Mark all fields as touched
    const allTouched = {};
    Object.keys(validationRules).forEach(field => {
      allTouched[field] = true;
    });
    setTouched(allTouched);
    
    return validation;
  };
  
  const reset = (newData = initialData) => {
    setFormData(newData);
    setErrors({});
    setTouched({});
  };
  
  const isValid = Object.values(errors).every(error => !error);
  
  return {
    formData,
    errors,
    touched,
    isValid,
    handleChange,
    handleBlur,
    validateAll,
    reset,
    setFormData,
    setErrors
  };
};

// Validation schemas for common forms
export const validationSchemas = {
  login: {
    email: [rules.required('Email'), rules.email()],
    password: [rules.required('Password')]
  },
  
  registration: {
    name: [rules.required('Name'), rules.minLength(2, 'Name')],
    email: [rules.required('Email'), rules.email()],
    phone: [rules.required('Phone'), rules.phone()],
    password: [rules.required('Password'), rules.password()],
    confirmPassword: [
      rules.required('Confirm Password'), 
      rules.custom(
        (value, formData) => value === formData.password,
        'Passwords do not match'
      )
    ]
  },
  
  product: {
    name: [rules.productName()],
    price: [rules.productPrice()],
    quantity: [rules.productQuantity()],
    category: [rules.required('Category')],
    unit: [rules.required('Unit')],
    description: [rules.maxLength(1000, 'Description')]
  },
  
  order: {
    delivery_address: [rules.deliveryAddress()],
    special_instructions: [rules.maxLength(500, 'Special instructions')]
  },
  
  supplier: {
    business_name: [rules.required('Business name'), rules.minLength(2, 'Business name')],
    address: [rules.required('Address'), rules.minLength(10, 'Address')],
    pincode: [rules.required('Pincode'), rules.pincode()],
    gstin: [rules.gstin()], // Optional but validated if provided
    contact_person: [rules.required('Contact person'), rules.minLength(2, 'Contact person')]
  },
  
  groupOrder: {
    productId: [rules.required('Product')],
    targetQuantity: [rules.required('Target quantity'), rules.positiveNumber('Target quantity')],
    myQuantity: [rules.required('My quantity'), rules.positiveNumber('My quantity')],
    maxPrice: [rules.required('Max price'), rules.positiveNumber('Max price')],
    expiryHours: [rules.required('Expiry time'), rules.positiveNumber('Expiry time')]
  }
};

export default {
  // Basic validators
  required,
  minLength,
  maxLength,
  minValue,
  maxValue,
  email,
  phone,
  password,
  confirmPassword,
  url,
  number,
  positiveNumber,
  integer,
  date,
  futureDate,
  pastDate,
  
  // Indian-specific validators
  pincode,
  gstin,
  pan,
  
  // RasoiLink-specific validators
  productName,
  productPrice,
  productQuantity,
  deliveryAddress,
  
  // Form validators
  validateLoginForm,
  validateRegistrationForm,
  validateProductForm,
  validateOrderForm,
  validateForm,
  
  // Utilities
  rules,
  useFormValidation,
  validationSchemas
};