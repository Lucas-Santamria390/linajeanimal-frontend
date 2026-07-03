/** Requisitos de validacion para contrasenas */
export const PASSWORD_REQUIREMENTS = [
  { label: 'Minimo 8 caracteres', test: (v) => v.length >= 8 },
  { label: 'Al menos una mayuscula', test: (v) => /[A-Z]/.test(v) },
  { label: 'Al menos un numero', test: (v) => /\d/.test(v) },
  { label: 'Al menos un caracter especial', test: (v) => /[!@#$%^&*(),.?":{}|<>_]/.test(v) },
]
