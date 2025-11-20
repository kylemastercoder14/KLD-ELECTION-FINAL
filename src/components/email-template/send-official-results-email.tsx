"use client";

import {
  Body,
  Column,
  Container,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
  render,
} from "@react-email/components";

interface WinnerSummary {
  candidateName: string;
  voteCount: number;
  partyName?: string | null;
}

interface PositionResultSummary {
  positionTitle: string;
  winners: WinnerSummary[];
  totalVotes: number;
}

interface TurnoutSummary {
  totalVoters: number;
  votedCount: number;
  percentage: string;
}

interface SendOfficialResultsEmailProps {
  voterName: string;
  electionTitle: string;
  announcementDate: string;
  positionResults: PositionResultSummary[];
  turnout?: TurnoutSummary;
  additionalNotes?: string;
}

export const SendOfficialResultsEmail = ({
  voterName,
  electionTitle,
  announcementDate,
  positionResults,
  turnout,
  additionalNotes,
}: SendOfficialResultsEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Official results have been released for {electionTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section>
            <Row>
              <Column>
                <Img
                  src={`https://kld-landing-page.vercel.app/_next/image?url=%2Fkld-logo.png&w=96&q=75`}
                  width="150"
                  height="150"
                  alt="Kolehiyo ng Lungsod ng Dasmariñas"
                />
              </Column>
            </Row>
          </Section>

          <Section>
            <Hr style={hr} />
            <Text style={heading}>
              Kolehiyo ng Lungsod ng Dasmariñas - Election Management System
            </Text>
            <Text style={paragraph}>Regal Day! {voterName},</Text>
            <Text style={paragraph}>
              The official canvassing for <strong>{electionTitle}</strong> has
              been completed. Certified results are now available as of{" "}
              {announcementDate}.
            </Text>
            <Text style={paragraph}>
              We appreciate your participation. Below is the summary of the
              winning candidates per position.
            </Text>
          </Section>

          {turnout && (
            <Section style={turnoutBox}>
              <Text style={sectionHeading}>Turnout Summary</Text>
              <Text style={paragraph}>
                <strong>Total Eligible Voters:</strong> {turnout.totalVoters}
              </Text>
              <Text style={paragraph}>
                <strong>Ballots Cast:</strong> {turnout.votedCount} (
                {turnout.percentage})
              </Text>
            </Section>
          )}

          <Section>
            <Hr style={hr} />
            <Text style={sectionHeading}>Official Winners</Text>
          </Section>

          <Section>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeader}>Position</th>
                  <th style={tableHeader}>Winner(s)</th>
                  <th style={tableHeader}>Vote Count</th>
                  <th style={tableHeader}>Total Votes</th>
                </tr>
              </thead>
              <tbody>
                {positionResults.map((result, index) => (
                  <tr key={`${result.positionTitle}-${index}`}>
                    <td style={tableCell}>
                      <Text style={positionTitle}>{result.positionTitle}</Text>
                    </td>
                    <td style={tableCell}>
                      {result.winners.length === 0 ? (
                        <Text style={paragraph}>No winners declared</Text>
                      ) : (
                        <div style={winnerList}>
                          {result.winners.map((winner, winnerIndex) => (
                            <div key={winnerIndex} style={winnerRow}>
                              <Text style={winnerName}>
                                {winner.candidateName}
                                {winner.partyName
                                  ? ` (${winner.partyName})`
                                  : ""}
                              </Text>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td style={tableCell}>
                      {result.winners.length === 0
                        ? "—"
                        : result.winners
                            .map((winner) => `${winner.voteCount} votes`)
                            .join(", ")}
                    </td>
                    <td style={tableCell}>{result.totalVotes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          {additionalNotes && (
            <Section style={notesBox}>
              <Text style={paragraph}>
                <strong>Additional Notes:</strong> {additionalNotes}
              </Text>
            </Section>
          )}

          <Section>
            <Hr style={hr} />
            <Text style={paragraph}>Thank you for being part of the process,</Text>
            <Text style={{ ...paragraph, fontSize: "20px" }}>
              The KLD Election Management Team
            </Text>
          </Section>

          <Section style={informationTable}>
            <Text style={informationTableDisclaimer}>
              DISCLAIMER: This email and any attachments are confidential and
              intended solely for the use of the named recipient(s). If you have
              received this email in error, please notify the sender and delete
              it from your system. Unauthorized dissemination, distribution, or
              copying is strictly prohibited.
            </Text>
          </Section>

          <Section>
            <Text style={footerCopyright}>
              Copyright © 2025 Kolehiyo ng Lungsod ng Dasmariñas. All rights
              reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const SendOfficialResultsEmailHTML = (
  props: SendOfficialResultsEmailProps
) =>
  render(<SendOfficialResultsEmail {...props} />, {
    pretty: true,
  });

const main = {
  backgroundColor: "#fff",
  fontFamily:
    '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
};

const container = {
  margin: "30px auto",
  backgroundColor: "#fff",
  borderRadius: 5,
  width: "900px",
  overflow: "hidden",
};

const heading = {
  fontSize: "14px",
  lineHeight: "26px",
  fontWeight: "700",
  color: "rgb(13, 42, 31)",
};

const sectionHeading = {
  fontSize: "16px",
  lineHeight: "26px",
  fontWeight: "700",
  color: "rgb(13, 42, 31)",
  margin: "10px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#3c4043",
};

const turnoutBox = {
  backgroundColor: "#f0fdf4",
  padding: "16px",
  borderRadius: "6px",
  border: "1px solid #bbf7d0",
  marginBottom: "20px",
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse" as const,
  border: "1px solid #e2e8f0",
};

const tableHeader = {
  backgroundColor: "#f8fafc",
  padding: "12px",
  fontSize: "13px",
  fontWeight: "600",
  color: "#334155",
  borderBottom: "2px solid #cbd5e1",
  textAlign: "left" as const,
};

const tableCell = {
  padding: "12px",
  fontSize: "13px",
  color: "#3c4043",
  borderBottom: "1px solid #e2e8f0",
  verticalAlign: "top" as const,
};

const positionTitle = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
  margin: "0",
};

const winnerList = {
  display: "flex",
  flexDirection: "column" as const,
  gap: "6px",
};

const winnerRow = {
  display: "flex",
  flexDirection: "column" as const,
};

const winnerName = {
  fontSize: "14px",
  color: "#1e293b",
  margin: "0",
};

const notesBox = {
  backgroundColor: "#fff7ed",
  padding: "16px",
  borderRadius: "6px",
  border: "1px solid #fed7aa",
  marginTop: "20px",
};

const hr = {
  borderColor: "#e8eaed",
  margin: "20px 0",
};

const informationTable = {
  borderCollapse: "collapse" as const,
  borderSpacing: "0px",
  color: "rgb(51,51,51)",
  backgroundColor: "rgb(250,250,250)",
  borderRadius: "3px",
  fontSize: "12px",
  marginTop: "12px",
};

const informationTableDisclaimer = {
  fontSize: "12px",
  fontStyle: "italic",
  margin: "0",
  padding: "0",
  lineHeight: 1.4,
};

const footerCopyright = {
  margin: "25px 0 0 0",
  textAlign: "center" as const,
  fontSize: "12px",
  color: "rgb(102,102,102)",
};


