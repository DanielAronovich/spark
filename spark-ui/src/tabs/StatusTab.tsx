import * as React from "react";
import NoQuery from "../components/NoQuery/NoQuery";
import SqlContainer from "../components/SqlContainer";
import StatusBar from "../components/StatusBar";
import { useAppSelector } from "../Hooks";
import { MixpanelService } from "../services/MixpanelService";

export default function StatusTab() {
  const sql = useAppSelector((state) => state.spark.sql);
  const isIdle =
    useAppSelector((state) => state.spark.status?.stages?.status) == "idle";

  React.useEffect(() => {
    MixpanelService.TrackPageView();
  }, []);

  return (
    <div style={{ display: "flex", height: "100%", flexDirection: "column" }}>
      <StatusBar />
      {sql === undefined || sql.sqls.length === 0 || isIdle ? (
        <div
          style={{
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <NoQuery />
        </div>
      ) : (
        <div style={{ height: "100%" }}>
          <div
            style={{
              textAlign: "center",
              display: "block",
              fontSize: "1.5em",
              fontWeight: "normal",
              margin: "2px 0 5px 0",
            }}
          >
            {sql.sqls[sql.sqls.length - 1].description}
          </div>
          <SqlContainer />
        </div>
      )}
    </div>
  );
}
