FROM amazoncorretto:21-alpine
RUN apk update && apk upgrade

WORKDIR /app

COPY mvnw mvnw.cmd ./
COPY .mvn/ .mvn/
COPY pom.xml ./

RUN chmod +x ./mvnw && ./mvnw dependency:resolve

COPY src ./src

CMD ["./mvnw", "spring-boot:run"]

EXPOSE 8080