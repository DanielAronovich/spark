import React, { FC } from 'react';
import { Handle, Position } from 'reactflow';
import { SqlMetric } from '../../interfaces/SparkSQLs';
import { v4 as uuidv4 } from 'uuid';
import styles from './node-style.module.css'

export const StageNodeName: string = "stageNode";

export const StageNode: FC<{ data: any }> = ({ data }): JSX.Element => {
    return (
        <>
            <Handle type="target" position={Position.Left} id="b" />
            <div className={styles.node}>
                <div className={styles.textWrapper}>
                    <div className={styles.nodeTitle}>{data.label}</div>
                    {data.metrics.map((metric: SqlMetric) => {
                        { return <div key={uuidv4()} className={styles.nodeMetric}>{`${metric.name}: ${metric.value}`}</div> }
                    })}
                </div>
            </div>
            <Handle type="source" position={Position.Right} id="a" />
        </>
    );
}