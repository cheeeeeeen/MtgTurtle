import { Card, Tag, Timeline, Typography } from 'antd';
import {
  BulbOutlined,
  EyeOutlined,
} from '@ant-design/icons';
import type { HintResult } from '@/types/card';

const { Text } = Typography;

interface HintPanelProps {
  hints: HintResult[];
  totalAvailable: number;
  remaining: number;
}

export default function HintPanel({
  hints,
  totalAvailable,
  remaining,
}: HintPanelProps) {
  return (
    <Card
      title={
        <span>
          <BulbOutlined style={{ marginRight: 8 }} />
          已揭示提示 ({hints.length}/{totalAvailable})
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
                  {hint.ruleName}
                </Tag>
                <Text>{hint.text}</Text>
              </div>
            ),
          }))}
        />
      )}
      {remaining > 0 && hints.length > 0 && (
        <Text type="secondary" style={{ fontSize: 12 }}>
          还有 {remaining} 条提示未揭示
        </Text>
      )}
      {remaining === 0 && hints.length > 0 && (
        <Text type="warning" style={{ fontSize: 12 }}>
          所有提示已揭示！
        </Text>
      )}
    </Card>
  );
}
