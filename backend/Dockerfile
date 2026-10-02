FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY .mvn .mvn
COPY mvnw pom.xml ./

RUN chmod +x mvnw
RUN ./mvnw dependency:go-offline

COPY src ./src

RUN ./mvnw -DskipTests package

CMD ["java", "-jar", "target/self-posted-0.0.1-SNAPSHOT.jar"]