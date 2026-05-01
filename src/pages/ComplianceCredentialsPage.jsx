import Shell from "../components/Shell";
import { CREDENTIAL_TYPES, demoOperators, normalizeCredentialStatus } from "../../shared/trainingProgram";
import TrainingStyles from "../components/training/TrainingStyles";

function ComplianceCredentialsPage() {
  const credentialRows = demoOperators.flatMap((operator) =>
    operator.credentials.map((credential, index) => ({
      ...credential,
      id: `${operator.id}-${index}`,
      operatorName: operator.name,
    })),
  );

  return (
    <Shell compact>
      <section className="section training-page">
        <TrainingStyles />
        <div className="training-header card">
          <span className="eyebrow">Compliance</span>
          <h1>Credential vault</h1>
          <p>
            Tracks credential uploads, review status, expirations, state/category fields, and evidence
            references. Harvest OS records readiness; it does not issue FAA or pesticide certifications.
          </p>
        </div>

        <article className="training-card card">
          <h2>Required credential types</h2>
          <div className="training-chip-grid">
            {Object.values(CREDENTIAL_TYPES).map((type) => (
              <span className="training-chip" key={type}>{type.replaceAll("_", " ")}</span>
            ))}
          </div>
        </article>

        <article className="table-card card">
          <div className="table-card__header">
            <h3>Operator credentials</h3>
            <span>{credentialRows.length} records</span>
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Operator</th>
                  <th>Credential</th>
                  <th>Status</th>
                  <th>State/category</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {credentialRows.map((credential) => (
                  <tr key={credential.id}>
                    <td>{credential.operatorName}</td>
                    <td>{credential.type.replaceAll("_", " ")}</td>
                    <td><span className="status-pill">{normalizeCredentialStatus(credential)}</span></td>
                    <td>{[credential.state, credential.category].filter(Boolean).join(" / ") || "-"}</td>
                    <td>{credential.expiresAt || "No expiration"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </article>
      </section>
    </Shell>
  );
}

export default ComplianceCredentialsPage;
