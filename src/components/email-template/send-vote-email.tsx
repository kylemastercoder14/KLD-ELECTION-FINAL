import {
  Body,
  Container,
  Column,
  Head,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
  render,
  Row,
} from "@react-email/components";

interface VotedCandidate {
  candidateName: string;
  positionTitle: string;
  candidateImage?: string;
  isAbstain?: boolean;
}

interface SendVoteConfirmationEmailProps {
  voterName: string;
  electionTitle: string;
  votedCandidates: VotedCandidate[];
  voteTimestamp: string;
  electionEndDate: string;
}

export const SendVoteConfirmationEmail = ({
  voterName,
  electionTitle,
  votedCandidates,
  voteTimestamp,
  electionEndDate,
}: SendVoteConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>
        Your vote has been successfully recorded for {electionTitle}
      </Preview>
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
              Your vote has been successfully recorded and counted. Thank you
              for participating in the democratic process.
            </Text>
          </Section>

          <Section style={electionInfoBox}>
            <Text style={electionTitleStyle}>
              <strong>Election:</strong> {electionTitle}
            </Text>
            <Text style={voteInfo}>
              <strong>Vote Cast:</strong> {voteTimestamp}
            </Text>
            <Text style={voteInfo}>
              <strong>Election Ends:</strong> {electionEndDate}
            </Text>
          </Section>

          <Section>
            <Hr style={hr} />
            <Text style={sectionHeading}>Your Vote Summary</Text>
            <Text style={paragraph}>
              Below is a summary of your ballot. Please keep this email for your
              records.
            </Text>
          </Section>

          {/* Ballot Summary Table */}
          <Section style={ballotTable}>
            <table style={tableStyle}>
              <thead>
                <tr>
                  <th style={tableHeader}>Position</th>
                  <th style={tableHeader}>Candidate(s)</th>
                </tr>
              </thead>
              <tbody>
                {votedCandidates.map((vote, index) => (
                  <tr key={index} style={tableRow}>
                    <td style={tableCell}>
                      <Text style={positionText}>{vote.positionTitle}</Text>
                    </td>
                    <td style={tableCell}>
                      {vote.isAbstain ? (
                        <Text style={abstainText}>
                          ABSTAINED (no candidate selected)
                        </Text>
                      ) : (
                        <div style={candidateContainer}>
                          {vote.candidateImage && (
                            <Img
                              src={vote.candidateImage}
                              width="40"
                              height="40"
                              alt={vote.candidateName}
                              style={candidateImage}
                            />
                          )}
                          <Text style={candidateText}>{vote.candidateName}</Text>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <Section style={confirmationBox}>
            <Text style={confirmationText}>
              ✓ Your vote has been securely recorded
            </Text>
            <Text style={confirmationSubtext}>
              Results will be announced after the election ends on{" "}
              {electionEndDate}
            </Text>
          </Section>

          <Section>
            <Hr style={hr} />
            <Text style={paragraph}>
              <strong>Important Notes:</strong>
            </Text>
            <Text style={noteText}>
              • Your vote is confidential and cannot be changed once submitted
            </Text>
            <Text style={noteText}>
              • This email serves as your official voting receipt
            </Text>
            <Text style={noteText}>
              • Election results will be available after the counting process
            </Text>
            <Text style={noteText}>
              • If you have any concerns, please contact the election committee
            </Text>
          </Section>

          <Section>
            <Hr style={hr} />
            <Text style={paragraph}>Thank you for your participation,</Text>
            <Text style={{ ...paragraph, fontSize: "20px" }}>
              The KLD Election Management Team
            </Text>
          </Section>

          <Section style={informationTable}>
            <Text style={informationTableDisclaimer}>
              DISCLAIMER: This email and any attachments are confidential and
              intended solely for the use of the named recipient(s). If you have
              received this email in error, please take immediate action to
              notify the Kolehiyo ng Lungsod ng Dasmariñas (KLD) by responding
              to the sender and deleting this email from your system. This email
              is not intended for distribution, copying, or sharing with any
              other party. Please be advised that any unauthorized
              dissemination, distribution, copying, or taking any action in
              reliance on the contents of this information is strictly
              prohibited. The views and opinions expressed in this email are
              those of the sender and do not necessarily reflect the views of
              KLD management and its personnel. By receiving this email, you
              acknowledge that you have read, understood, and will comply with
              the terms of this confidentiality notice.
            </Text>
          </Section>

          <Section>
            <Text style={footerCopyright}>
              Copyright © 2025 Kolehiyo ng Lungsod ng Dasmariñas. All rights
              reserved. <br />{" "}
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export const SendVoteConfirmationEmailHTML = (
  props: SendVoteConfirmationEmailProps
) =>
  render(<SendVoteConfirmationEmail {...props} />, {
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
  width: "1200px",
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
  marginBottom: "10px",
};

const electionInfoBox = {
  backgroundColor: "#f0f9ff",
  padding: "15px",
  borderRadius: "5px",
  marginTop: "15px",
  marginBottom: "15px",
  border: "1px solid #bae6fd",
};

const electionTitleStyle = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#0c4a6e",
  margin: "5px 0",
};

const voteInfo = {
  fontSize: "13px",
  lineHeight: "20px",
  color: "#334155",
  margin: "5px 0",
};

const ballotTable = {
  marginTop: "20px",
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
  textAlign: "left" as const,
  fontSize: "13px",
  fontWeight: "600",
  color: "#334155",
  borderBottom: "2px solid #cbd5e1",
};

const tableRow = {
  borderBottom: "1px solid #e2e8f0",
};

const tableCell = {
  padding: "12px",
  fontSize: "13px",
  color: "#3c4043",
  margin: "0 10px",
  verticalAlign: "middle" as const,
};

const positionText = {
  fontSize: "14px",
  fontWeight: "600",
  color: "#1e293b",
  margin: "0",
};

const candidateContainer = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
};

const candidateImage = {
  borderRadius: "50%",
  objectFit: "cover" as const,
};

const candidateText = {
  fontSize: "14px",
  color: "#334155",
  margin: "5px",
};

const abstainText = {
  fontSize: "14px",
  color: "#b91c1c",
  fontStyle: "italic",
  margin: "5px",
};

const confirmationBox = {
  backgroundColor: "#f0fdf4",
  padding: "20px",
  borderRadius: "5px",
  marginTop: "20px",
  marginBottom: "20px",
  border: "1px solid #86efac",
  textAlign: "center" as const,
};

const confirmationText = {
  fontSize: "16px",
  fontWeight: "700",
  color: "#166534",
  margin: "0 0 8px 0",
};

const confirmationSubtext = {
  fontSize: "13px",
  color: "#15803d",
  margin: "0",
};

const noteText = {
  fontSize: "13px",
  lineHeight: "22px",
  color: "#64748b",
  margin: "5px 0",
};

const paragraph = {
  fontSize: "14px",
  lineHeight: "22px",
  color: "#3c4043",
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
