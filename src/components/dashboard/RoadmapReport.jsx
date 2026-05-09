// src/components/dashboard/RoadmapReport.jsx

import React from "react";

const Section = ({ title, children }) => {
  return (
    <section className="mb-6">
      <h2 className="mb-3 border-b border-gray-300 pb-2 text-lg font-bold text-gray-900">
        {title}
      </h2>
      {children}
    </section>
  );
};

const SkillList = ({ skills = [] }) => {
  if (!skills || skills.length === 0) {
    return <p className="text-sm text-gray-500">No skills available.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill, index) => (
        <span
          key={`${skill}-${index}`}
          className="rounded-full border border-gray-300 bg-gray-100 px-3 py-1 text-xs font-medium text-gray-800"
        >
          {skill}
        </span>
      ))}
    </div>
  );
};

const RoadmapReport = ({ analysis }) => {
  const generatedDate = new Date().toLocaleDateString("en-IN", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  if (!analysis) {
    return (
      <div className="bg-white p-8 text-gray-900">
        <h1 className="text-2xl font-bold">AI Career Navigator Report</h1>
        <p className="mt-4 text-sm text-gray-600">
          No analysis data available for PDF export.
        </p>
      </div>
    );
  }

  const resumeName =
    analysis?.resumeName ||
    analysis?.resume?.fileName ||
    analysis?.resume?.originalName ||
    "Uploaded Resume";

  const targetRole =
    analysis?.targetRole ||
    analysis?.role ||
    analysis?.selectedRole ||
    "Not specified";

  const roleTitle =
    analysis?.roleTitle ||
    analysis?.targetRoleTitle ||
    analysis?.careerRole ||
    targetRole;

  const readinessScore =
    analysis?.jobReadiness ??
    analysis?.jobReadinessScore ??
    analysis?.readinessScore ??
    analysis?.score ??
    0;

  const readinessReason =
    analysis?.readinessReason ||
    analysis?.scoreReason ||
    analysis?.jobReadinessReason ||
    "No readiness reason available.";

  const extractedSkills =
    analysis?.extractedSkills ||
    analysis?.skills?.extracted ||
    analysis?.currentSkills ||
    [];

  const matchedSkills =
    analysis?.matchedSkills ||
    analysis?.skills?.matched ||
    analysis?.matchingSkills ||
    [];

  const missingSkills =
    analysis?.missingSkills ||
    analysis?.skills?.missing ||
    analysis?.gapSkills ||
    [];

  const summary =
    analysis?.aiSummary ||
    analysis?.summary ||
    analysis?.careerSummary ||
    "No AI summary available.";

  const recommendations =
    analysis?.aiRecommendations || analysis?.recommendations || [];

  const roadmap =
    analysis?.aiRoadmap ||
    analysis?.roadmap ||
    analysis?.weeklyRoadmap ||
    analysis?.learningRoadmap ||
    [];

  const aiProvider =
    analysis?.aiProviderUsed ||
    analysis?.aiProvider ||
    analysis?.provider ||
    analysis?.metadata?.provider ||
    "Not available";

  const modelUsed =
    analysis?.aiModelUsed ||
    analysis?.modelUsed ||
    analysis?.model ||
    analysis?.metadata?.model ||
    "Not available";

  const promptVersion =
    analysis?.promptVersion ||
    analysis?.metadata?.promptVersion ||
    "Not available";

  return (
    <div className="w-full bg-white p-8 text-gray-900">
      {/* Header */}
      <div className="mb-8 border-b-2 border-gray-900 pb-4">
        <h1 className="text-3xl font-extrabold text-gray-950">
          AI Career Navigator Report
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Personalized career readiness and learning roadmap report
        </p>
      </div>

      {/* Candidate Overview */}
      <Section title="Candidate Overview">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700">Resume Name</p>
            <p className="mt-1 text-gray-900">{resumeName}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Target Role</p>
            <p className="mt-1 text-gray-900">{targetRole}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Role Title</p>
            <p className="mt-1 text-gray-900">{roleTitle}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Generated Date</p>
            <p className="mt-1 text-gray-900">{generatedDate}</p>
          </div>
        </div>
      </Section>

      {/* Readiness Score */}
      <Section title="Job Readiness Score">
        <div className="rounded-lg border border-gray-300 bg-gray-50 p-4">
          <p className="text-4xl font-extrabold text-gray-950">
            {readinessScore}%
          </p>
          <p className="mt-3 text-sm leading-6 text-gray-700">
            {readinessReason}
          </p>
        </div>
      </Section>

      {/* Skills */}
      <Section title="Extracted Skills">
        <SkillList skills={extractedSkills} />
      </Section>

      <Section title="Matched Skills">
        <SkillList skills={matchedSkills} />
      </Section>

      <Section title="Missing Skills">
        <SkillList skills={missingSkills} />
      </Section>

      {/* AI Summary */}
      <Section title="AI Career Summary">
        <p className="text-sm leading-6 text-gray-700">{summary}</p>
      </Section>

      {/* Recommendations */}
      <Section title="AI Recommendations">
        {recommendations && recommendations.length > 0 ? (
          <div className="space-y-3">
            {recommendations.map((item, index) => (
              <div
                key={`recommendation-${index}`}
                className="rounded-lg border border-gray-300 bg-gray-50 p-3 text-sm leading-6 text-gray-700"
              >
                <span className="font-bold text-gray-900">{index + 1}.</span>{" "}
                {item}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500">No recommendations available.</p>
        )}
      </Section>

      {/* Weekly Roadmap */}
      <Section title="Week-by-Week Roadmap">
        {roadmap && roadmap.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-300">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2 font-bold">
                    Week
                  </th>
                  <th className="border border-gray-300 px-3 py-2 font-bold">
                    What to Learn
                  </th>
                  <th className="border border-gray-300 px-3 py-2 font-bold">
                    How to Learn
                  </th>
                  <th className="border border-gray-300 px-3 py-2 font-bold">
                    Mini Project
                  </th>
                </tr>
              </thead>

              <tbody>
                {roadmap.map((week, index) => (
                  <tr key={`roadmap-week-${index}`}>
                    <td className="border border-gray-300 px-3 py-2 align-top font-semibold">
                      {week?.week || `Week ${index + 1}`}
                    </td>

                    <td className="border border-gray-300 px-3 py-2 align-top">
                      <p className="font-semibold text-gray-900">
                        {week?.skill || week?.topic || "Not available"}
                      </p>

                      <p className="mt-1 text-gray-700">
                        {week?.learn || week?.whatToLearn || "Not available"}
                      </p>

                      {week?.difficulty && (
                        <p className="mt-2 text-xs text-gray-500">
                          Difficulty: {week.difficulty}
                        </p>
                      )}

                      {week?.timeEstimate && (
                        <p className="mt-1 text-xs text-gray-500">
                          Time: {week.timeEstimate}
                        </p>
                      )}
                    </td>

                    <td className="border border-gray-300 px-3 py-2 align-top">
                      <p>
                        {week?.howToLearn || week?.resources || "Not available"}
                      </p>

                      {week?.resource && (
                        <p className="mt-2 text-xs text-gray-500">
                          Resource: {week.resource}
                        </p>
                      )}
                    </td>

                    <td className="border border-gray-300 px-3 py-2 align-top">
                      {week?.project || week?.miniProject || "Not available"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500">No roadmap available.</p>
        )}
      </Section>

      {/* AI Metadata */}
      <Section title="AI Provider Metadata">
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div>
            <p className="font-semibold text-gray-700">AI Provider</p>
            <p className="mt-1 text-gray-900">{aiProvider}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Model Used</p>
            <p className="mt-1 text-gray-900">{modelUsed}</p>
          </div>

          <div>
            <p className="font-semibold text-gray-700">Prompt Version</p>
            <p className="mt-1 text-gray-900">{promptVersion}</p>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="mt-8 border-t border-gray-300 pt-4 text-center text-xs text-gray-500">
        Generated by AI Career Navigator
      </footer>
    </div>
  );
};

export default RoadmapReport;
