export function isValidEmail(email) {
  return (
    typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  );
}

export function isStrongPassword(password) {
  const hasMinimumLength = typeof password === "string" && password.length >= 8;
  const hasNumber = /\d/.test(password);
  const hasSpecialCharacter = /[^A-Za-z0-9\s]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);

  return hasMinimumLength &&
    hasNumber &&
    hasSpecialCharacter &&
    hasUppercase &&
    hasLowercase
    ? "Password is Strong"
    : "Password is Weak";
}

export function isPasswordMatched(password, reEnteredPassword) {
  return password === reEnteredPassword;
}
