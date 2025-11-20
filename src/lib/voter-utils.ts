import { User, VoterRestriction } from "@prisma/client";

/**
 * Determines the user type based on their profile data
 */
export function getUserType(
  user: User
): "student" | "faculty" | "non-teaching" | "unknown" {
  // Check if user is a student (has year, course, or section)
  if (user.year || user.course || user.section) {
    return "student";
  }

  // Check if user is faculty (has institute or department)
  if (user.institute || user.department) {
    return "faculty";
  }

  // Check if user is non-teaching (has unit)
  if (user.unit) {
    return "non-teaching";
  }

  return "unknown";
}

/**
 * Checks if a user is eligible to vote in an election based on voter restrictions
 */
export function canUserVote(
  user: User,
  voterRestriction: VoterRestriction
): boolean {
  // If restriction is ALL, everyone can vote
  if (voterRestriction === VoterRestriction.ALL) {
    return true;
  }

  const userType = getUserType(user);

  switch (voterRestriction) {
    case VoterRestriction.STUDENTS:
      return userType === "student";

    case VoterRestriction.FACULTY:
      return userType === "faculty";

    case VoterRestriction.NON_TEACHING:
      return userType === "non-teaching";

    case VoterRestriction.STUDENTS_FACULTY:
      return userType === "student" || userType === "faculty";

    default:
      return true;
  }
}

/**
 * Gets a human-readable description of the voter restriction
 */
export function getVoterRestrictionDescription(
  restriction: VoterRestriction
): string {
  switch (restriction) {
    case VoterRestriction.ALL:
      return "All users";
    case VoterRestriction.STUDENTS:
      return "Students only";
    case VoterRestriction.FACULTY:
      return "Faculty only";
    case VoterRestriction.NON_TEACHING:
      return "Non-teaching staff only";
    case VoterRestriction.STUDENTS_FACULTY:
      return "Students and faculty";
    default:
      return "Unknown";
  }
}
