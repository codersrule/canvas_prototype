/**
 * validate.js — shared express-validator result handler.
 *
 * Usage:
 *   import { validate } from '../middleware/validate.js'
 *   import { body } from 'express-validator'
 *
 *   router.post('/login',
 *     body('email').isEmail().normalizeEmail(),
 *     body('password').isLength({ min: 1 }),
 *     validate,          // <-- returns 422 if any rule failed
 *     asyncHandler,
 *   )
 *
 * Returns a consistent error shape:
 *   { errors: [{ field: 'email', message: 'Must be a valid email address' }] }
 */

import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path ?? e.param,
    message: e.msg,
  }));

  return res.status(422).json({ errors });
}
