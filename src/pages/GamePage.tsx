import { Typography } from 'antd';
import GameBoard from '@/components/GameBoard';
import { FORMAT_OPTIONS, useGameStore } from '@/stores/gameStore';

const { Title, Text } = Typography;

export default function GamePage() {
  const formatFilter = useGameStore((s) => s.formatFilter);
  const formatLabel =
    FORMAT_OPTIONS.find((f) => f.code === formatFilter)?.name || '全部赛制';

  return (
    <div>
      <Title level={4} style={{ marginBottom: 4 }}>
        自由模式
      </Title>
      <Text type="secondary" style={{ display: 'block', marginBottom: 16 }}>
        赛制：{formatLabel}
      </Text>
      <GameBoard mode="free" />
    </div>
  );
}
