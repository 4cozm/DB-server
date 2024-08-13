#!/bin/bash

# 현재 디렉토리로 이동
cd "$(dirname "$0")"

# Docker Compose 실행
docker-compose up -d

# 실행 결과를 기다리기 위해 잠시 대기
echo "Docker Compose가 실행되었습니다. 종료하려면 [Enter]를 누르세요."
read
