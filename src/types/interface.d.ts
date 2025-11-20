import {
  Candidate,
  Election,
  Party,
  PartyApplication,
  Position,
  SystemLog,
  User,
  Vote,
} from "@prisma/client";

export interface SystemLogWithUser extends SystemLog {
  user: User | null;
}

export interface ElectionWithProps extends Election {
  positions: Position[];
  createdByUser: User;
  candidates: Candidate[];
}

interface CandidateWithUser extends Candidate {
  user: User;
  position?: Position;
}

export interface CandidateWithPosition extends Candidate {
  position: Position;
}

export interface UserWithCandidate extends User {
  candidate: CandidateWithPosition | null;
}

export interface PartyApplicationWithUser extends PartyApplication {
  user: UserWithCandidate;
}

export interface PartyWithCandidates extends Party {
  applications: PartyApplicationWithUser[];
  head?: UserWithCandidate | null;
}

export interface CandidacyApplication extends Candidate {
  election: Election;
  position: Position;
  party: Party | null;
}

export interface CandidateWithParty extends Candidate {
  user: User & {
    partyApplications: (PartyApplication & {
      party: Party;
    })[];
  };
  election: Election;
  position: Position;
  votes: Vote[];
}

export type PartyWithStatus = PartyWithCandidates & { hasApplied: boolean };

export type VoteWithRelations = Vote & {
  candidate: Candidate & {
    user: User;
    position: Position;
    election: Election;
  };
  election: Election;
  position: Position;
  voter: User;
};
