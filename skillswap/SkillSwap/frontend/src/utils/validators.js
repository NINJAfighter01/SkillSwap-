export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
};

export const validatePassword = (password) => {
    return password.length >= 6;
};

export const validateUsername = (username) => {
    const regex = /^[a-zA-Z0-9_]{3,20}$/;
    return regex.test(username);
};

export const validateTokenAmount = (amount) => {
    return Number.isInteger(amount) && amount > 0;
};