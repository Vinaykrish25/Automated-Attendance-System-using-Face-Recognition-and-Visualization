import React, { useEffect, useRef, useState } from "react";
import * as powerbi from "powerbi-client";

const PowerBIReport = () => {
  const reportRef = useRef();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTokenAndEmbed = async () => {
      try {
        const response = await fetch("http://localhost:5005/api/powerbi/token");
        const data = await response.json();

        if (response.ok && data.embedToken && data.embedUrl && data.reportId) {
          const embedConfig = {
            type: "report",
            tokenType: powerbi.models.TokenType.Embed,
            accessToken: data.embedToken,
            embedUrl: data.embedUrl,
            id: data.reportId,
            permissions: powerbi.models.Permissions.All,
            settings: {
              filterPaneEnabled: true,
              navContentPaneEnabled: true,
            },
          };

          const report = powerbi.embed(reportRef.current, embedConfig);
          setLoading(false);

          return () => {
            report?.destroy?.();
          };
        } else {
          throw new Error("Failed to get embed configuration");
        }
      } catch (err) {
        console.error("Embedding Error:", err);
        setError("Failed to load Power BI report.");
        setLoading(false);
      }
    };

    fetchTokenAndEmbed();
  }, []);

  return (
    <div>
      <h2>📊 Power BI Attendance Report</h2>
      {loading && <p>Loading Power BI report...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}
      <div ref={reportRef} style={{ height: "700px", width: "100%" }}></div>
    </div>
  );
};

export default PowerBIReport;
