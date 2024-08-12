import { CloudWatchClient, GetMetricDataCommand } from "@aws-sdk/client-cloudwatch";

import dotenv from "dotenv"; // 나중에 삭제
dotenv.config();

export let metricLastCheck;

const client = new CloudWatchClient({ region: "ap-northeast-2" });

/**
 * 샤드에 대한 이름을 삽입시 CPU 사용량과 남은 저장공간을 반환
 * @param {String} shard name
 */
export const getMetrics = async (shard) => {
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
                  Value: shard,
                },
              ],
            },
            Period: 60,
            Stat: "Average",
          },
          ReturnData: true,
        },
        {
          Id: "freeStorageSpace",
          MetricStat: {
            Metric: {
              Namespace: "AWS/RDS",
              MetricName: "FreeStorageSpace",
              Dimensions: [
                {
                  Name: "DBInstanceIdentifier",
                  Value: "shard-1", // 실제 RDS 인스턴스 ID로 변경
                },
              ],
            },
            Period: 60 * 60, // 1시간 간격으로 데이터 집계
            Stat: "Average",
          },
          ReturnData: true,
        },
      ],
      StartTime: new Date(Date.now() - 3600 * 1000), // 1 hour ago
      EndTime: new Date(),
    });

    const data = await client.send(command);
    const metricData = data.MetricDataResults[0]; // 첫 번째 쿼리 결과
    if (metricData.Values.length > 0) {
      const mostRecentValue = metricData.Values[mostRecentTimestampIndex];

      console.log(mostRecentValue);
    } else {
      console.log("DB상태 기록이 없습니다");
    }
    const freeStorage = data.MetricDataResults[1];
    if (freeStorage.Values.length > 0) {
      console.log(bytesToMB(freeStorage.Values[0]));
    }
    lastCheck = Date.now();
  } catch (error) {
    console.error("에러 발생", error);
  }
};

const bytesToMB = (bytes) => {
  return Math.round(bytes / (1024 * 1024));
};
