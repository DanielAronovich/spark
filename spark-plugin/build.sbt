lazy val root = project
  .in(file("."))
  .aggregate(
    plugin,
    example_3_1_3,
    example_3_2_4,
    example_3_3_3,
    example_3_4_1
  )

lazy val plugin = (project in file("plugin"))
  .settings(
    name := "SparkPlugin",
    organization := "com.anecdota",
    scalaVersion := "2.12.18",
    version      := "0.1.0",
    libraryDependencies += "org.apache.spark" %% "spark-core" % "3.4.1" % "provided",
    libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.4.1"  % "provided"
  )

lazy val example_3_1_3 = (project in file("example_3_1_3"))
  .settings(
    name := "SparkExample313",
    organization := "com.anecdota",
    scalaVersion := "2.12.18",
    libraryDependencies += "org.apache.spark" %% "spark-core" % "3.1.3" % "provided",
    libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.1.3" % "provided"
  ).dependsOn(plugin)

lazy val example_3_2_4 = (project in file("example_3_2_4"))
  .settings(
    name := "SparkExample324",
    organization := "com.anecdota",
    scalaVersion := "2.12.18",
    libraryDependencies += "org.apache.spark" %% "spark-core" % "3.2.4" % "provided",
    libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.2.4" % "provided"
  ).dependsOn(plugin)

lazy val example_3_3_3 = (project in file("example_3_3_3"))
  .settings(
    name := "SparkExample333",
    organization := "com.anecdota",
    scalaVersion := "2.12.18",
    libraryDependencies += "org.apache.spark" %% "spark-core" % "3.3.3" % "provided",
    libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.3.3" % "provided"
  ).dependsOn(plugin)

lazy val example_3_4_1 = (project in file("example_3_4_1"))
  .settings(
    name := "SparkExample341",
    organization := "com.anecdota",
    scalaVersion := "2.12.18",
    libraryDependencies += "org.apache.spark" %% "spark-core" % "3.4.1" % "provided",
    libraryDependencies += "org.apache.spark" %% "spark-sql" % "3.4.1" % "provided"
  ).dependsOn(plugin)
