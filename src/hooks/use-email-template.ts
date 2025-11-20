"use server";
import nodemailer from "nodemailer";
import { SendAccountToEmailHTML } from "@/components/email-template/send-account-email";
import { SendVoteConfirmationEmailHTML } from "@/components/email-template/send-vote-email";
import { SendOfficialResultsEmailHTML } from "@/components/email-template/send-official-results-email";

export const sendAccountToEmail = async (
  email: string,
  name: string,
  password: string,
  studentNumber: string
) => {
  const htmlContent = await SendAccountToEmailHTML({
    name,
    password,
    studentNumber,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kylemastercoder14@gmail.com",
      pass: "nrihffkvfsgfhnbn",
    },
  });

  const message = {
    from: "kylemastercoder14@gmail.com",
    to: email,
    subject: "This is your account details",
    text: `Hello ${name}, your account has been created. Here is your student/employee number: ${studentNumber} and password: ${password}. Please change your password after logging in.`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(message);

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending notification", error);
    return { message: "An error occurred. Please try again." };
  }
};

interface VotedCandidate {
  candidateName: string;
  positionTitle: string;
  candidateImage?: string;
  isAbstain?: boolean;
}

export const sendVoteToEmail = async (
  email: string,
  voterName: string,
  electionTitle: string,
  votedCandidates: VotedCandidate[],
  voteTimestamp: string,
  electionEndDate: string
) => {
  const htmlContent = await SendVoteConfirmationEmailHTML({
    voterName,
    electionTitle,
    votedCandidates,
    voteTimestamp,
    electionEndDate,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kylemastercoder14@gmail.com",
      pass: "nrihffkvfsgfhnbn",
    },
  });

  const message = {
    from: "kylemastercoder14@gmail.com",
    to: email,
    subject: `Vote Confirmation - ${electionTitle}`,
    text: `Hello ${voterName}, your vote has been casted. You can review your ballot now.`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(message);

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending notification", error);
    return { message: "An error occurred. Please try again." };
  }
};

export interface OfficialResultsPosition {
  positionTitle: string;
  winners: {
    candidateName: string;
    voteCount: number;
    partyName?: string | null;
  }[];
  totalVotes: number;
}

export interface OfficialResultsTurnout {
  totalVoters: number;
  votedCount: number;
  percentage: string;
}

export const sendOfficialResultsToEmail = async (
  email: string,
  voterName: string,
  electionTitle: string,
  announcementDate: string,
  positionResults: OfficialResultsPosition[],
  turnout?: OfficialResultsTurnout,
  additionalNotes?: string
) => {
  const htmlContent = await SendOfficialResultsEmailHTML({
    voterName,
    electionTitle,
    announcementDate,
    positionResults,
    turnout,
    additionalNotes,
  });

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: "kylemastercoder14@gmail.com",
      pass: "nrihffkvfsgfhnbn",
    },
  });

  const message = {
    from: "kylemastercoder14@gmail.com",
    to: email,
    subject: `Official Results - ${electionTitle}`,
    text: `Hello ${voterName},\n\nThe official results for ${electionTitle} are now available. Please see the EMS portal for full details.`,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(message);

    return { success: "Email has been sent." };
  } catch (error) {
    console.error("Error sending official results email", error);
    return {
      message: "An error occurred while sending official results email.",
    };
  }
};
