import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  EMAIL_OTP_STANDARD_LENGTH,
  EMAIL_OTP_MIN_LENGTH,
  EMAIL_OTP_MAX_LENGTH,
  normalizeEmailOtp,
  isCompleteEmailOtp,
  isValidEmailOtp,
} from '../src/lib/emailOtp.ts';

test('EMAIL_OTP constants are properly configured', () => {
  assert.equal(EMAIL_OTP_STANDARD_LENGTH, 6);
  assert.equal(EMAIL_OTP_MIN_LENGTH, 6);
  assert.equal(EMAIL_OTP_MAX_LENGTH, 8);
});

test('normalizeEmailOtp removes non-numeric characters and enforces max length', () => {
  assert.equal(normalizeEmailOtp('123 456'), '123456');
  assert.equal(normalizeEmailOtp('12-34-56'), '123456');
  assert.equal(normalizeEmailOtp('abc123456def'), '123456');
  assert.equal(normalizeEmailOtp('1234567890'), '12345678'); // capped at 8
  assert.equal(normalizeEmailOtp(''), '');
});

test('isCompleteEmailOtp accepts valid 6-digit or 8-digit OTPs', () => {
  assert.equal(isCompleteEmailOtp('123456'), true);
  assert.equal(isCompleteEmailOtp('12345678'), true);
  assert.equal(isCompleteEmailOtp('000000'), true);
  assert.equal(isCompleteEmailOtp('99999999'), true);

  // Incomplete or invalid lengths
  assert.equal(isCompleteEmailOtp('12345'), false);
  assert.equal(isCompleteEmailOtp('1234567'), false);
  assert.equal(isCompleteEmailOtp('123456789'), false);
  assert.equal(isCompleteEmailOtp(''), false);
  assert.equal(isCompleteEmailOtp('abcdef'), false);
  assert.equal(isCompleteEmailOtp('12345a'), false);
});

test('isValidEmailOtp delegates to isCompleteEmailOtp', () => {
  assert.equal(isValidEmailOtp('654321'), true);
  assert.equal(isValidEmailOtp('87654321'), true);
  assert.equal(isValidEmailOtp('123'), false);
});
