package io.dataflint.example

import org.apache.spark.sql.{DataFrame, SparkSession}

import java.nio.file.Paths

object Shakespeare341Exported {
    def fsPath(resource: String): String =
    Paths.get(this.getClass.getResource(resource).toURI).toString

  def df(spark: SparkSession): DataFrame = spark.read
    .format("csv")
    .option("sep", ";")
    .option("inferSchema", true)
    .load(fsPath("will_play_text.csv"))
    .toDF("line_id", "play_name", "speech_number", "line_number", "speaker", "text_entry")
    .repartition(1000)

  def main(args: Array[String]): Unit = {
    val spark = SparkSession
      .builder
      .appName("Shakespeare Statistics Exported")
      .config("spark.plugins", "io.dataflint.spark.SparkDataflintPlugin")
      .config("spark.ui.port", "10000")
      .config("spark.sql.maxMetadataStringLength", "10000")
      .config("spark.eventLog.enabled", "true")
      .master("local[*]")
      .getOrCreate()

    val shakespeareText = df(spark)

    val count = shakespeareText.count()
    println(s"number of records : $count")

    spark.stop()
  }
}