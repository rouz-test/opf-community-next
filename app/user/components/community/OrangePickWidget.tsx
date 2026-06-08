import { Box, Flex, Grid, Image, Text } from '@chakra-ui/react';
import NewsIcon from '@/app/user/components/icons/NewsIcon';

type OrangePickArticle = {
  id: string | number;
  thumbnail: string;
  title: string;
  excerpt: string;
  author: string;
};

type OrangePickWidgetProps = {
  articles: OrangePickArticle[];
};

export function OrangePickWidget({ articles }: OrangePickWidgetProps) {
  return (
    <Box
      borderRadius="20px"
      bg="#FFFFFF"
      p="16px"
      boxShadow="0 12px 30px rgba(223, 223, 223, 0.9)"
    >
      <Flex align="center" gap="8px" mb="16px">
        <NewsIcon size={20} color="#FF6900" />
        <Text fontSize="14px" fontWeight="700" color="#111827">
          오렌지픽
        </Text>
      </Flex>

      <Grid gap="16px">
        {articles.map((article) => (
          <Box
            key={article.id}
            role="group"
            cursor="pointer"
          >
            <Box mb="8px" aspectRatio="16 / 9" overflow="hidden" borderRadius="12px" bg="#F3F4F6">
              <Image
                src={article.thumbnail}
                alt={article.title}
                h="100%"
                w="100%"
                objectFit="cover"
                transition="transform 0.3s ease"
                _groupHover={{ transform: 'scale(1.05)' }}
              />
            </Box>
            <Text
              mb="4px"
              lineClamp={2}
              fontSize="14px"
              fontWeight="600"
              color="#111827"
              transition="color 0.2s ease"
              _groupHover={{ color: '#F97316' }}
            >
              {article.title}
            </Text>
            <Text mb="8px" lineClamp={2} fontSize="12px" color="#6B7280">
              {article.excerpt}
            </Text>
            <Text fontSize="12px" color="#9CA3AF">
              {article.author}
            </Text>
          </Box>
        ))}
      </Grid>
    </Box>
  );
}
