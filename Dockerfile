FROM eclipse-temurin:21-jre-jammy AS runtime
WORKDIR /app
COPY target/anagrafica-radiologica-0.0.1-SNAPSHOT.war app.war
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.war"]
