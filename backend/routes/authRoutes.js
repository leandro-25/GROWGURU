const express = require('express');
const AuthController = require('../controllers/authController');
const { validate, schemas } = require('../middleware/validation');
const { errorHandler } = require('../middleware/errorHandler');
const { authLimiter } = require('../middleware/security');

const router = express.Router();

// Rota para login
router.post('/login', authLimiter, validate(schemas.login), AuthController.login);

// Rota para cadastro
router.post('/signup', authLimiter, validate(schemas.signup), AuthController.signup);

// Rota para recuperação de senha
router.post('/forgot-password', authLimiter, validate(schemas.forgotPassword), AuthController.forgotPassword);

// Rota para redefinição de senha
router.post('/reset-password', authLimiter, validate(schemas.resetPassword), AuthController.resetPassword);

module.exports = router;