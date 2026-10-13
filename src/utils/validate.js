const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function validateName(value) {
  const name = value.trim()
  if (!name) return 'Name is required.'
  if (name.length < 3) return 'Name must be at least 3 characters.'
  if (!/^[a-zA-Z][a-zA-Z\s'.-]*$/.test(name)) return 'Name may only contain letters and spaces.'
  return ''
}

export function validateEmail(value) {
  const email = value.trim()
  if (!email) return 'Email is required.'
  if (!EMAIL_PATTERN.test(email)) return 'Enter a valid email address.'
  return ''
}

export function validatePassword(value) {
  if (!value) return 'Password is required.'
  if (value.length < 8) return 'Password must be at least 8 characters.'
  if (!/[a-zA-Z]/.test(value)) return 'Password must contain at least one letter.'
  if (!/\d/.test(value)) return 'Password must contain at least one number.'
  return ''
}

export function validateConfirmation(password, confirmation) {
  if (!confirmation) return 'Please confirm your password.'
  if (password !== confirmation) return 'Passwords do not match.'
  return ''
}

export function passwordStrength(value) {
  let score = 0
  if (value.length >= 8) score += 1
  if (value.length >= 12) score += 1
  if (/[A-Z]/.test(value) && /[a-z]/.test(value)) score += 1
  if (/\d/.test(value)) score += 1
  if (/[^A-Za-z0-9]/.test(value)) score += 1
  if (score <= 2) return { score, label: 'Weak' }
  if (score === 3) return { score, label: 'Fair' }
  if (score === 4) return { score, label: 'Good' }
  return { score, label: 'Strong' }
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean)
}
