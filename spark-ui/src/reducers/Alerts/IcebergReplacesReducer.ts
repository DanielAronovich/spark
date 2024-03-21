import { Alerts, SparkSQLStore } from "../../interfaces/AppStore";
import { calculatePercentage } from "../../utils/FormatUtils";

const REPLACED_MOST_OF_TABLE_PERCENTAGE_THRESHOLD = 60;
const REPLACED_MORE_FILES_THAN_RECORDS_PERCENTAGE_THRESHOLD = 30;

export function reduceIcebergReplaces(sql: SparkSQLStore, alerts: Alerts) {
    sql.sqls.forEach((sql) => {
        sql.nodes.forEach((node) => {
            if (node.icebergCommit === undefined || (node.nodeName !== "ReplaceData")) {
                return;
            }
            const metrics = node.icebergCommit.metrics;
            const tableChangedPercentage = calculatePercentage(metrics.removedDataFiles, metrics.totalDataFiles);
            const recordsChangedPercentage = metrics.removedRecords === metrics.totalRecords ? calculatePercentage(metrics.removedRecords, metrics.totalRecords) : calculatePercentage(Math.abs(metrics.addedRecords - metrics.removedRecords), metrics.totalRecords);

            if (
                tableChangedPercentage > REPLACED_MORE_FILES_THAN_RECORDS_PERCENTAGE_THRESHOLD &&
                recordsChangedPercentage < REPLACED_MORE_FILES_THAN_RECORDS_PERCENTAGE_THRESHOLD
            ) {
                alerts.push({
                    id: `inneficiantIcebergReplaceTable_${sql.id}_${node.nodeId}`,
                    name: "inneficiantIcebergReplaceTable",
                    title: "Inneficiant Replace Of Data In Iceberg Table",
                    location: `In: SQL query "${sql.description}" (id: ${sql.id}) and node "${node.nodeName}"`,
                    message: `${tableChangedPercentage.toFixed(1)}% of table ${node.icebergCommit.tableName} files were replaced, while only ${recordsChangedPercentage.toFixed(1)}% of records were changed`,
                    suggestion: `
    1. Switch to merge-on-read mode to avoid the need to write the entire table data
    2. Partition the table in such a way that use of update/merge/delete operation to update only the required partitions
                        `,
                    type: "warning",
                    source: {
                        type: "sql",
                        sqlId: sql.id,
                        sqlNodeId: node.nodeId,
                    },
                });
            }
            else if (
                tableChangedPercentage > REPLACED_MOST_OF_TABLE_PERCENTAGE_THRESHOLD
            ) {
                alerts.push({
                    id: `replacedMostOfIcebergTable_${sql.id}_${node.nodeId}`,
                    name: "replacedMostOfIcebergTable",
                    title: "Replaced Most Of Iceberg Table",
                    location: `In: SQL query "${sql.description}" (id: ${sql.id}) and node "${node.nodeName}"`,
                    message: `${tableChangedPercentage.toFixed(1)}% of table ${node.icebergCommit.tableName} files were replaced, which is a mis-use of iceberg update/merge/delete operations `,
                    suggestion: `
    1. Partition the table in such a way that use of update/merge/delete operation to update only the required partitions
    2. Switch to merge-on-read mode to avoid the need to write the entire table data
                        `,
                    type: "warning",
                    source: {
                        type: "sql",
                        sqlId: sql.id,
                        sqlNodeId: node.nodeId,
                    },
                });
            }
        })
    });
}