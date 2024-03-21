package org.apache.spark.dataflint.listener

import com.fasterxml.jackson.annotation.JsonIgnore
import org.apache.spark.scheduler.SparkListenerEvent
import org.apache.spark.util.kvstore.KVIndex

case class IcebergCommitMetrics(
                                 durationMS: Long,
                                 attempts: Long,
                                 addedDataFiles: Long,
                                 removedDataFiles: Long,
                                 totalDataFiles: Long,
                                 addedDeleteFiles: Long,
                                 addedEqualityDeleteFiles: Long,
                                 addedPositionalDeleteFiles: Long,
                                 removedDeleteFiles: Long,
                                 removedEqualityDeleteFiles: Long,
                                 removedPositionalDeleteFiles: Long,
                                 totalDeleteFiles: Long,
                                 addedRecords: Long,
                                 removedRecords: Long,
                                 totalRecords: Long,
                                 addedFilesSizeInBytes: Long,
                                 removedFilesSizeInBytes: Long,
                                 totalFilesSizeInBytes: Long,
                                 addedPositionalDeletes: Long,
                                 removedPositionalDeletes: Long,
                                 totalPositionalDeletes: Long,
                                 addedEqualityDeletes: Long,
                                 removedEqualityDeletes: Long,
                                 totalEqualityDeletes: Long
                               )

case class IcebergCommitInfo(executionId: Int, tableName: String, commitId: Long, operation: String, metrics: IcebergCommitMetrics )

case class IcebergCommitEvent(icebergCommit: IcebergCommitInfo) extends SparkListenerEvent

class IcebergCommitWrapper(val info: IcebergCommitInfo) {

  @JsonIgnore @KVIndex
  def id: String = info.executionId.toString
}