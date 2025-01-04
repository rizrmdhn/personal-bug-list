export const SONNER_DEFAULT_TOAST_DURATION = 1500;

export const SONNER_WARNING_TOAST_DURATION = 3000;

export const MAXIMUM_FILE_SIZE = 2 * 1024 * 1024; // 2 MB

export const MAXIMUM_FILE_SIZE_HUMAN_READABLE = "2MB";

export const MAXIMUM_FILE_SIZE_REACH_MESSAGE = `File size must be less than ${MAXIMUM_FILE_SIZE_HUMAN_READABLE}`;

export const AVALIABLE_BUG_SEVERITY = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
] as const;

export const AVALIABLE_BUG_TAG = [
  "UI",
  "FUNCTIONALITY",
  "PERFORMANCE",
  "SECURITY",
  "CRASH",
  "NETWORK",
  "DATABASE",
  "OTHER",
] as const;

export const AVALIABLE_BUG_STATUS = [
  "SUBMITTED",
  "PROCESSING",
  "ACCEPTED",
  "REJECTED",
] as const;
