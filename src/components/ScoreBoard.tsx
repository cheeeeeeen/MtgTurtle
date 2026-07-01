import { Card, Statistic, Row, Col, Progress } from 'antd';
import {
  TrophyOutlined,
  FireOutlined,
  CheckCircleOutlined,
  StarOutlined,
} from '@ant-design/icons';
import type { GameStats } from '@/types/card';

interface ScoreBoardProps {
  stats: GameStats;
}

export default function ScoreBoard({ stats }: ScoreBoardProps) {
  const winRate =
    stats.totalGames > 0
      ? Math.round((stats.totalWins / stats.totalGames) * 100)
      : 0;

  return (
    <Card title="我的统计" size="small">
      <Row gutter={[16, 16]}>
        <Col span={12}>
          <Statistic
            title="总场次"
            value={stats.totalGames}
            prefix={<TrophyOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="胜率"
            value={winRate}
            suffix="%"
            prefix={<CheckCircleOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="当前连胜"
            value={stats.currentStreak}
            prefix={<FireOutlined />}
          />
        </Col>
        <Col span={12}>
          <Statistic
            title="最高分"
            value={stats.bestScore}
            prefix={<StarOutlined />}
          />
        </Col>
      </Row>
      <Progress
        percent={winRate}
        status={winRate >= 50 ? 'active' : 'exception'}
        style={{ marginTop: 12 }}
        size="small"
      />
    </Card>
  );
}
