import { v7 as uuidv7 } from "uuid";
import crypto from "crypto";

/**
 * Generates secure application credentials consisting of an application key and secret.
 *
 * @returns An object containing:
 * - `appKey` - A UUIDv7 string that serves as a unique identifier
 * - `appSecret` - A 48-byte random string encoded in base64url format for authentication
 *
 * @example
 * const credentials = generateApplicationCredentials();
 *  Returns:
 * // {
 * //   appKey: "018e6f32-b832-7ed8-9988-1234567890ab",
 * //   appSecret: "dBj8zw_gbtaGWSRXhm2Ny1RrUT5zj8bNJ1XGw3tegF4"
 * // }
 */
function generateApplicationCredentials() {
  // Generate app key using UUIDv7
  const appKey = uuidv7();

  // Generate a 32-byte random secret and encode as base64
  const appSecret = crypto.randomBytes(48).toString("base64url");

  return {
    appKey, // Example: "018e6f32-b832-7ed8-9988-1234567890ab"
    appSecret, // Example: "dBj8zw_gbtaGWSRXhm2Ny1RrUT5zj8bNJ1XGw3tegF4"
  };
}

export default generateApplicationCredentials;
