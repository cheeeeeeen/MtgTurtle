import { Card, Select, Space, Typography } from 'antd';
import {
  DIFFICULTY_OPTIONS,
  FORMAT_OPTIONS,
  useGameStore,
} from '@/stores/gameStore';

const { Text } = Typography;

export default function SettingsPanel() {
  const formatFilter = useGameStore((s) => s.formatFilter);
  const setFormatFilter = useGameStore((s) => s.setFormatFilter);
  const difficulty = useGameStore((s) => s.difficulty);
  const setDifficulty = useGameStore((s) => s.setDifficulty);

  return (
    <Card title="游戏设置" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            赛制选择
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            选择赛制后，热度过滤将基于该赛制的套牌使用数
          </Text>
          <Select
            value={formatFilter}
            onChange={setFormatFilter}
            style={{ width: '100%' }}
            options={FORMAT_OPTIONS.map((f) => ({
              value: f.code,
              label: f.name,
            }))}
          />
        </div>
        <div>
          <Text strong style={{ display: 'block', marginBottom: 4 }}>
            难度选择
          </Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
            难度决定答案卡牌的套牌使用热度门槛，不直接调整分数
          </Text>
          <Select
            value={difficulty}
            onChange={setDifficulty}
            style={{ width: '100%' }}
            options={DIFFICULTY_OPTIONS.map((option) => ({
              value: option.code,
              label: `${option.name}（${option.description}）`,
            }))}
          />
        </div>
      </Space>
    </Card>
  );
}
