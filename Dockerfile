# 멀티 스테이지 빌드
FROM node:20-alpine AS builder

# 작업 디렉토리 설정
WORKDIR /app

# 루트 package.json과 package-lock.json 복사
COPY package*.json ./

# 루트 의존성 설치 (빌드를 위해 devDependencies도 포함)
RUN npm ci && npm cache clean --force

# resources 디렉토리의 package.json 복사
COPY resources/package*.json ./resources/

# resources 의존성 설치
RUN cd resources && npm ci && npm cache clean --force

# 소스 코드 복사
COPY . .

# resources 빌드 (CSS, JS 등)
RUN cd resources && npm run build

# NestJS 애플리케이션 빌드
RUN npm run build

# 프로덕션 스테이지
FROM node:20-alpine AS production

# 보안을 위한 non-root 사용자 생성
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# 작업 디렉토리 설정
WORKDIR /app

# package.json 복사 후 프로덕션 의존성만 설치
COPY --from=builder --chown=nestjs:nodejs /app/package*.json ./
RUN npm ci --only=production && npm cache clean --force

# 필요한 파일들만 복사
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/resources/assets ./resources/assets
COPY --from=builder --chown=nestjs:nodejs /app/resources/views ./resources/views

# 사용자 전환
USER nestjs

# 포트 노출
EXPOSE 3000

# 환경 변수 설정
ENV NODE_ENV=production
ENV PORT=3000

# 애플리케이션 실행
CMD ["npm", "run", "start:prod"]
