/**
 * validate.js — shared express-validator result handler.
 *
 * Returns a consistent error shape on 422:
 *   {
 *     error: 'Field1 message; Field2 message',   // summary string for simple clients
 *     errors: [{ field: 'title', message: '...' }]  // structured list for rich clients
 *   }
 */

import { validationResult } from "express-validator";

export function validate(req, res, next) {
  const result = validationResult(req);
  if (result.isEmpty()) return next();

  const errors = result.array().map((e) => ({
    field: e.path ?? e.param ?? "unknown",
    message: e.msg,
  }));

  // Log in dev so backend errors are easy to spot
  if (process.env.NODE_ENV !== "production") {
    console.warn("[validate] 422 on", req.method, req.path, errors);
  }

  return res.status(422).json({
    error: errors.map((e) => `${e.field}: ${e.message}`).join("; "),
    errors,
  });
}
