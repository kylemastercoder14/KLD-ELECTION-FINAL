import { User, VoterRestriction } from "@prisma/client";

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

  const userType = user.userType;

  switch (voterRestriction) {
    case VoterRestriction.STUDENTS:
      return userType === "STUDENT";

    case VoterRestriction.FACULTY:
      return userType === "FACULTY";

    case VoterRestriction.NON_TEACHING:
      return userType === "NON_TEACHING";

    case VoterRestriction.STUDENTS_FACULTY:
      return userType === "STUDENT" || userType === "FACULTY";

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

