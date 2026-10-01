FROM eclipse-temurin:21-jdk

WORKDIR /app

COPY . .

RUN chmod +x mvnw
RUN ./mvnw -DskipTests package

CMD ["java", "-jar", "target/self-posted-0.0.1-SNAPSHOT.jar"]