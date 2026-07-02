import { Modal, Descriptions, Tag, Image, Typography, Divider } from 'antd';
import { TrophyOutlined, FrownOutlined } from '@ant-design/icons';
import type { MtgCard } from '@/types/card';

const { Text, Title } = Typography;

interface CardRevealProps {
  open: boolean;
  card: MtgCard | null;
  won: boolean;
  guessCount: number;
  hintsRevealed: number;
  score: number;
  onClose: () => void;
  onPlayAgain: () => void;
}

const rarityColors: Record<string, string> = {
  common: 'default',
  uncommon: 'silver',
  rare: 'gold',
  mythic: 'orange',
  special: 'purple',
};

const colorNames: Record<string, string> = {
  W: '白', U: '蓝', B: '黑', R: '红', G: '绿',
};

export default function CardReveal({
  open,
  card,
  won,
  guessCount,
  hintsRevealed,
  score,
  onClose,
  onPlayAgain,
}: CardRevealProps) {
  if (!card) return null;

  const cnName =
    card.atomic_official_name ||
    card.atomic_translated_name ||
    card.name;
  const cnType = card.atomic_translated_type || card.type_line;
  const cnText = card.atomic_translated_text || card.oracle_text;
  const cnFlavor = card.atomic_translated_flavor_text || card.flavor_text;
  const setName = card.set_translated_name || card.set_name;
  const imageUrl = card.image_uris?.normal || card.image_uris?.large || '';

  return (
    <Modal
      open={open}
      onCancel={onClose}
      onOk={onPlayAgain}
      okText="再来一局"
      cancelText="关闭"
      width={700}
      title={
        <span>
          {won ? (
            <TrophyOutlined style={{ color: '#faad14', marginRight: 8 }} />
          ) : (
            <FrownOutlined style={{ color: '#999', marginRight: 8 }} />
          )}
          {won ? '恭喜猜对！' : '答案揭晓'}
        </span>
      }
      styles={{ body: { maxHeight: '70vh', overflow: 'auto' } }}
    >
      {/* 卡牌图片 */}
      {imageUrl && (
        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <Image
            src={imageUrl}
            alt={card.name}
            style={{ maxHeight: 340, borderRadius: 12 }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQwIiBoZWlnaHQ9IjMzMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZTVlNWU1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM5OTkiPk5vIEltYWdlPC90ZXh0Pjwvc3ZnPg=="
          />
        </div>
      )}

      {/* 卡牌名称 */}
      <Title level={3} style={{ textAlign: 'center', marginBottom: 4 }}>
        {cnName}
      </Title>
      {cnName !== card.name && (
        <Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 16 }}
        >
          {card.name}
        </Text>
      )}

      <Divider />

      {/* 卡牌详情 */}
      <Descriptions column={2} size="small" bordered>
        <Descriptions.Item label="英文牌名">{card.name}</Descriptions.Item>
        <Descriptions.Item label="中文牌名">{cnName}</Descriptions.Item>
        <Descriptions.Item label="法术力费用">
          <code>{card.mana_cost}</code>
        </Descriptions.Item>
        <Descriptions.Item label="CMC">{card.cmc}</Descriptions.Item>
        <Descriptions.Item label="颜色">
          {card.colors.length > 0
            ? card.colors.map((c) => colorNames[c] || c).join('/')
            : '无色'}
        </Descriptions.Item>
        <Descriptions.Item label="类别">{cnType}</Descriptions.Item>
        <Descriptions.Item label="稀有度">
          <Tag color={rarityColors[card.rarity] || 'default'}>
            {card.rarity}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="系列">{setName}</Descriptions.Item>
        {card.power !== null && card.power !== undefined && (
          <Descriptions.Item label="攻/防">
            {card.power}/{card.toughness}
          </Descriptions.Item>
        )}
        {card.loyalty && (
          <Descriptions.Item label="初始忠诚">{card.loyalty}</Descriptions.Item>
        )}
        <Descriptions.Item label="发行日期">{card.released_at}</Descriptions.Item>
        <Descriptions.Item label="画家">{card.artist}</Descriptions.Item>
      </Descriptions>

      {cnText && (
        <>
          <Divider>规则文本</Divider>
          <Text style={{ whiteSpace: 'pre-wrap' }}>{cnText}</Text>
        </>
      )}

      {cnFlavor && (
        <>
          <Divider>风味文字</Divider>
          <Text style={{ whiteSpace: 'pre-wrap', fontStyle: 'italic' }}>
            {cnFlavor}
          </Text>
        </>
      )}

      {/* 本局统计 */}
      <Divider>本局数据</Divider>
      <Descriptions column={3} size="small" bordered>
        <Descriptions.Item label="猜测次数">{guessCount}</Descriptions.Item>
        <Descriptions.Item label="揭示提示">{hintsRevealed}</Descriptions.Item>
        <Descriptions.Item label="得分">
          <Text strong style={{ fontSize: 18, color: '#faad14' }}>
            {score}
          </Text>
        </Descriptions.Item>
      </Descriptions>
    </Modal>
  );
}
