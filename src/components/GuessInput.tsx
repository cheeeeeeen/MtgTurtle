import { AutoComplete, Input, Space, Tag } from 'antd';
import { SearchOutlined } from '@ant-design/icons';

import { useAutocomplete } from '@/hooks/useAutocomplete';

interface GuessInputProps {
  onGuess: (value: string) => void;
  disabled: boolean;
  guessCount: number;
}

export default function GuessInput({ onGuess, disabled, guessCount }: GuessInputProps) {
  const { options, search } = useAutocomplete();

  return (
    <div style={{ marginBottom: 16 }}>
      <Space style={{ marginBottom: 8 }}>
        <Tag color="blue">第 {guessCount + 1} 次猜测</Tag>
      </Space>
      <AutoComplete
        options={options}
        onSearch={search}
        onSelect={(value) => onGuess(value as string)}
        style={{ width: '100%' }}
        disabled={disabled}
      >
        <Input
          size="large"
          placeholder="输入牌名猜测（支持中英文）..."
          prefix={<SearchOutlined />}
          onPressEnter={(e) => {
            const value = (e.target as HTMLInputElement).value.trim();
            if (value) onGuess(value);
          }}
          disabled={disabled}
        />
      </AutoComplete>
    </div>
  );
}
