import { Card, Tag, Timeline, Typography } from 'antd';
import {
  BulbOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { HintResult } from '@/types/card';

const { Text } = Typography;

interface HintPanelProps {
  hints: HintResult[];
  currentLevel: number;
  maxLevel: number;
  exhausted: boolean;
}

export default function HintPanel({
  hints,
  currentLevel,
  maxLevel,
  exhausted,
}: HintPanelProps) {
  return (
    <Card
      title={
        <span>
          <BulbOutlined style={{ marginRight: 8 }} />
          已揭示提示 ({hints.length})
        </span>
      }
      size="small"
      style={{ height: '100%' }}
    >
      {hints.length === 0 ? (
        <Text type="secondary">等待游戏开始...</Text>
      ) : (
        <Timeline
          items={hints.map((hint, i) => ({
            color: hint.isSpoiler ? 'orange' : 'blue',
            dot: hint.isSpoiler ? <EyeOutlined /> : undefined,
            children: (
              <div key={i}>
                <Tag
                  color={hint.isSpoiler ? 'orange' : 'blue'}
                  style={{ marginBottom: 4 }}
                >
                  Lv.{hint.level} {hint.ruleName}
                </Tag>
                <Text>{hint.text}</Text>
              </div>
            ),
          }))}
        />
      )}
      {!exhausted && hints.length > 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          当前提示等级：Lv.{Math.min(currentLevel, maxLevel)}
        </Text>
      )}
      {exhausted && hints.length > 0 && (
        <Text type="warning" style={{ fontSize: 12 }}>
          提示机会已耗尽
        </Text>
      )}
    </Card>
  );
}
