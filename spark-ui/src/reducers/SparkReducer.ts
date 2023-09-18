import { ApiAction } from "../interfaces/APIAction";
import { AppStore, EnrichedSparkSQL, EnrichedSqlMetric, NodeType, SparkSQLStore, StatusStore } from '../interfaces/AppStore';
import { SparkConfiguration } from "../interfaces/SparkConfiguration";
import { SparkSQL, SparkSQLs } from "../interfaces/SparkSQLs";
import { SparkStages } from "../interfaces/SparkStages";
import { humanFileSize } from "../utils/FormatUtils";
import isEqual from 'lodash/isEqual';

function extractConfig(sparkConfiguration: SparkConfiguration): [string, Record<string, string>] {
    const sparkPropertiesObj = Object.fromEntries(sparkConfiguration.sparkProperties);
    const systemPropertiesObj = Object.fromEntries(sparkConfiguration.systemProperties);
    const runtimeObj = sparkConfiguration.runtime;

    const appName = sparkPropertiesObj["spark.app.name"];
    const config = {
        "spark.app.name": sparkPropertiesObj["spark.app.name"],
        "spark.app.id": sparkPropertiesObj["spark.app.id"],
        "sun.java.command": systemPropertiesObj["sun.java.command"],
        "spark.master": sparkPropertiesObj["spark.master"],
        "javaVersion": runtimeObj["javaVersion"],
        "scalaVersion": runtimeObj["scalaVersion"]
    };
    return [appName, config]
}

function calcNodeType(name: string): NodeType {
    if(name === "Scan csv" || name === "Scan text") {
        return "input";
    } else if(name === "Execute InsertIntoHadoopFsRelationCommand") {
        return "output";
    } else if(name === "BroadcastHashJoin" || name === "SortMergeJoin" || name === "CollectLimit") {
        return "join";
    } else if(name === "filter") {
        return "transformation";
    } else {
        return "other"
    }
}

const metricAllowlist: Record<NodeType, Array<string>> = {
    "input": ["number of output rows", "number of files", "size of files"],
    "output": ["number of written files", "number of output rows", "written output"],
    "join": ["number of output rows"],
    "transformation": ["number of output rows"],
    "other": []
}

function calcNodeMetrics(type: NodeType, metrics: EnrichedSqlMetric[]): EnrichedSqlMetric[] {
    const allowList = metricAllowlist[type];
    return metrics.filter(metric => allowList.includes(metric.name))
}

function calculateSql(sqls: SparkSQL): EnrichedSparkSQL {
    const enrichedSql = sqls as EnrichedSparkSQL;
    const nodes = enrichedSql.nodes.map(node => {
        const type = calcNodeType(node.nodeName);
        return {...node, metrics: calcNodeMetrics(type, node.metrics), type: type, isVisible: type !== "other"};
    });

    if(nodes.filter(node => node.type === 'output').length === 0) {
        // if there is no output, update the last node which is not "AdaptiveSparkPlan" to be the output
        const filtered = nodes.filter(node => node.nodeName !== "AdaptiveSparkPlan")
        const lastNode = filtered[filtered.length - 1];
        lastNode.type = 'output';
        lastNode.isVisible = true;
    }

    return {...enrichedSql, nodes: nodes};
}

function calculateSqls(sqls: SparkSQLs): EnrichedSparkSQL[] {
    return sqls.map(calculateSql);
}

function calculateSqlStore(currentStore: SparkSQLStore | undefined, sqls: SparkSQLs): SparkSQLStore {
    if(currentStore === undefined) {
        return { sqls: calculateSqls(sqls) };
    }
    else if(currentStore.sqls.length === sqls.length) {
        const updatedCurrentSql = calculateSql(sqls[sqls.length - 1])
        if(isEqual(updatedCurrentSql, currentStore.sqls[currentStore.sqls.length - 1] )) {
            return currentStore;
        } else {
            return { sqls: [...currentStore.sqls.slice(0, currentStore.sqls.length - 2), updatedCurrentSql] };
        }

    } else {
        return { sqls: [...currentStore.sqls, ...calculateSqls(sqls.slice(currentStore.sqls.length - 1))] };
    }
}

function calculateStatus(existingStore: StatusStore | undefined, stages: SparkStages): StatusStore {
    const stagesDataClean = stages.filter((stage: Record<string, any>) => stage.status != "SKIPPED")
    const totalActiveTasks = stagesDataClean.map((stage: Record<string, any>) => stage.numActiveTasks).reduce((a: number, b: number) => a + b, 0);
    const totalPendingTasks = stagesDataClean.map((stage: Record<string, any>) => stage.numTasks - stage.numActiveTasks - stage.numFailedTasks - stage.numCompleteTasks).reduce((a: number, b: number) => a + b, 0);
    const totalInput = stagesDataClean.map((stage: Record<string, any>) => stage.inputBytes).reduce((a: number, b: number) => a + b, 0);
    const totalOutput = stagesDataClean.map((stage: Record<string, any>) => stage.outputBytes).reduce((a: number, b: number) => a + b, 0);
    const status = totalActiveTasks == 0 ? "idle" : "working";

    const state: StatusStore = {
        totalActiveTasks: totalActiveTasks,
        totalPendingTasks: totalPendingTasks,
        totalInput: humanFileSize(totalInput),
        totalOutput: humanFileSize(totalOutput),
        status: status
    }

    if(existingStore === undefined) {
        return state;
    } else if(isEqual(state, existingStore)) {
        return existingStore;
    } else {
        return state;
    }
}


export function sparkApiReducer(state: AppStore, action: ApiAction): AppStore {
    switch (action.type) {
        case 'setInitial':
            const [appName, config] = extractConfig(action.config)
            return { ...state, isInitialized: true, appName: appName, appId: action.appId, sparkVersion: action.sparkVersion, config: config, status: undefined, sql: undefined };
        case 'setSQL':
            const sqlStore = calculateSqlStore(state.sql, action.value);
            if(sqlStore === state.sql) {
                return state;
            } else {
                return { ...state, sql: sqlStore };
            }
        case 'setStatus':
            const status = calculateStatus(state.status, action.value);
            if(status === state.status) {
                return state;
            } else {
                return { ...state, status: status };
            }
        default:
            return state;
    }
}
