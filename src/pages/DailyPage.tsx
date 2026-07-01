import { Typography } from 'antd';
import GameBoard from '@/components/GameBoard';
import { getTodayUTCDate } from '@/engine/daily-challenge';

const { Title, Text } = Typography;

export default function DailyPage() {
  const today = getTodayUTCDate();

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4 }}>
        每日挑战
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        {today} 的每日挑战 —— 全球所有玩家今天猜同一张牌！
      </Text>
      <GameBoard mode="daily" />
    </div>
  );
}
