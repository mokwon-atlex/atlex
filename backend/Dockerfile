# syntax=docker/dockerfile:1

# ---- build stage ----
FROM eclipse-temurin:17-jdk AS build
WORKDIR /app

# Gradle wrapper + 빌드 스크립트 먼저 복사 (의존성 캐시 활용)
COPY gradlew settings.gradle build.gradle ./
COPY gradle gradle
RUN chmod +x gradlew

# 소스 복사 후 bootJar 빌드
COPY src src
RUN ./gradlew bootJar --no-daemon -x test

# ---- run stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/build/libs/app.jar app.jar
EXPOSE 8080
# 컨테이너 메모리 한도(mem_limit)의 60%를 힙으로 사용 → t3.micro(1GB)에서 OOM 방지
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=60.0", "-jar", "app.jar"]
