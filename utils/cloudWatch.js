import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";

const client = new CloudWatchClient({ region: "ap-northeast-2" });
export class ShardData {
  constructor(shardName) {
    this.shardName = shardName;
    this.lastAccessed = Date.now(); // 마지막 조회일자
    this.cpuUsage; // CPU 사용량
    this.remainingStorage; // 남은 저장 공간
  }

  async initialize() {
    await this.updateCpuUsage();
    await this.updateRemainingStorage();
  }

  async updateCpuUsage() {
    try {
      const command = new GetMetricDataCommand({
        MetricDataQueries: [
          {
            Id: "m1",
            MetricStat: {
              Metric: {
                Namespace: "AWS/RDS",
                MetricName: "CPUUtilization",
                Dimensions: [
                  {
                    Name: "DBInstanceIdentifier",
                    Value: this.shardName,
                  },
                ],
              },
              Period: 60,
              Stat: "Average",
            },
            ReturnData: true,
          },
        ],
        StartTime: new Date(Date.now() - 3600 * 1000),
        EndTime: new Date(),
      });

      const data = await client.send(command);
      const metricData = data.MetricDataResults[0];
      if (metricData.Values.length > 0) {
        const mostRecentTimestampIndex = metricData.Timestamps.length - 1;
        const mostRecentValue = metricData.Values[mostRecentTimestampIndex];
        this.cpuUsage = mostRecentValue;
        console.log(`CPU 사용량 ${this.shardName}: ${mostRecentValue}%`);
        return mostRecentValue;
      } else {
        console.log("CPU 기록을 불러오는데 실패했습니다.");
        return null;
      }
    } catch (error) {
      console.error("에러 발생", error);
      return null;
    }
  }

  // 남은 저장 공간을 업데이트하는 메서드
  async updateRemainingStorage() {
    try {
      const command = new GetMetricDataCommand({
        MetricDataQueries: [
          {
            Id: "freeStorageSpace",
            MetricStat: {
              Metric: {
                Namespace: "AWS/RDS",
                MetricName: "FreeStorageSpace",
                Dimensions: [
                  {
                    Name: "DBInstanceIdentifier",
                    Value: this.shardName,
                  },
                ],
              },
              Period: 60 * 60, // 1시간 간격으로 데이터 집계
              Stat: "Average",
            },
            ReturnData: true,
          },
        ],
        StartTime: new Date(Date.now() - 3600 * 1000),
        EndTime: new Date(),
      });

      const data = await client.send(command);
      const freeStorage = data.MetricDataResults[0];
      if (freeStorage.Values.length > 0) {
        const result = this.bytesToMB(freeStorage.Values[0]);
        this.remainingStorage = result;
        console.log(`남은 저장공간 ${this.shardName}: ${result} MB`);

        return result;
      } else {
        console.error("저장 공간에 대한 조회 실패");
        return null;
      }
    } catch (error) {
      console.error("에러 발생", error);
      return null;
    }
  }

  getShardData() {
    return {
      shardName: this.shardName,
      lastAccessed: this.lastAccessed,
      cpuUsage: this.cpuUsage,
      remainingStorage: this.remainingStorage,
    };
  }

  // 변환 방식 변경시 사용할 예정
  bytesToMB(bytes) {
    return bytes / (1024 * 1024);
  }
}
