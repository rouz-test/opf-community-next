'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { Box, Flex, Grid, HStack, Select, Text, createListCollection } from '@chakra-ui/react';
import { ChevronDown, ChevronRight } from 'lucide-react';

const familySites = [
  { label: 'Smilegate Official', href: 'https://www.smilegate.com/' },
  { label: 'Smilegate Megaport', href: 'https://www.smilegate.com/megaport/main/main' },
  { label: 'Smilegate Investment', href: 'https://www.smilegateinvestment.com/' },
  { label: 'Smilegate AI', href: 'https://smilegate.ai/' },
  { label: 'STOVE', href: 'https://www.onstove.com/' },
  { label: 'Smilegate Social Impact', href: 'https://socialimpact.smilegate.com/' },
  { label: 'Smilegate Foundation', href: 'https://smilegatefoundation.org/' },
  { label: 'Future Lab', href: 'https://www.futurelab.center/' },
  { label: '오렌지플래닛 창업재단', href: 'https://www.orangeplanet.or.kr/' },
];

const partnerLabels = [
  'Smilegate Official',
  'Smilegate Megaport',
  'Smilegate Investment',
  'Smilegate AI',
  'STOVE',
  'Smilegate Social Impact',
  'Smilegate Foundation',
  'Future lab',
  '오렌지플래닛 창업재단',
];

export default function Footer() {
  const familySiteCollection = useMemo(() => createListCollection({ items: familySites }), []);

  return (
    <Box as="footer" mt="20" bg="white">
      <Box bg="#FF6900">
        <Flex
          mx="auto"
          maxW="1280px"
          align="center"
          justify="space-between"
          gap="4"
          px={{ base: '5', md: '8', xl: '10' }}
          py={{ base: '5', md: '6' }}
          direction={{ base: 'column', sm: 'row' }}
        >
          <HStack gap="3" color="white" w={{ base: 'full', sm: 'auto' }}>
            <Flex
              h="8"
              w="8"
              flexShrink={0}
              align="center"
              justify="center"
              rounded="full"
              borderWidth="1px"
              borderColor="whiteAlpha.700"
              bg="whiteAlpha.100"
            >
              <Text fontSize="13px" fontWeight="700">
                N
              </Text>
            </Flex>
            <Text fontSize={{ base: '16px', md: '18px' }} fontWeight="700" letterSpacing="-0.01em">
              오렌지플래닛 뉴스레터 구독하기
            </Text>
          </HStack>

          <Link href="https://www.orangepark.or.kr/" target="_blank">
            <Flex
              as="span"
              h="48px"
              minW={{ base: 'full', sm: 'auto' }}
              align="center"
              justify="space-between"
              gap="4"
              rounded="full"
              bg="white"
              px="5"
              fontSize="14px"
              fontWeight="700"
              color="#FF6900"
              boxShadow="0 12px 24px rgba(191, 83, 0, 0.18)"
            >
              <Text>바로가기</Text>
              <Flex h="8" w="8" align="center" justify="center" rounded="full" bg="#FF6900" color="white">
                <ChevronRight size={16} />
              </Flex>
            </Flex>
          </Link>
        </Flex>
      </Box>

      <Box borderTopWidth="1px" borderColor="#F3F4F6">
        <Box mx="auto" maxW="1280px" px={{ base: '5', md: '8', xl: '10' }} py={{ base: '10', md: '14' }}>
          <Grid templateColumns={{ base: '1fr', lg: 'minmax(0, 1fr) 360px' }} gap={{ base: '10', lg: '12' }}>
            <Box>
              <Text
                fontSize={{ base: '32px', md: '40px' }}
                fontWeight="700"
                lineHeight="1"
                letterSpacing="-0.03em"
                color="#FF6900"
              >
                재단법인 오렌지플래닛
              </Text>

              <Box mt="7" display="flex" flexDirection="column" gap="2">
                <Text fontSize={{ base: '14px', md: '16px' }} fontWeight="500" lineHeight="1.8" color="#FF6900">
                  서울 강남구 테헤란로 217 오렌지플래닛 2~6F
                </Text>
                <Text fontSize={{ base: '14px', md: '16px' }} fontWeight="500" lineHeight="1.8" color="#FF6900">
                  사업자번호 : 151-82-00395 센터번호 : 02-2192-5297
                </Text>
              </Box>

              <Text mt="8" fontSize={{ base: '13px', md: '15px' }} lineHeight="1.8" color="#FF6900">
                Copyright 2024© ORANGE PLANET FOUNDATION. All rights reserved.
              </Text>
            </Box>

            <Box>
              <HStack
                flexWrap="wrap"
                align="center"
                columnGap="5"
                rowGap="3"
                fontSize={{ base: '14px', md: '15px' }}
                fontWeight="700"
                color="#FF6900"
              >
                <Link href="https://standing-lung-5b4.notion.site" target="_blank">
                  서비스 이용약관
                </Link>
                <Link href="https://orangeplanet.or.kr" target="_blank">
                  개인정보 처리방침
                </Link>
              </HStack>

              <HStack
                mt="7"
                flexWrap="wrap"
                align="center"
                columnGap="6"
                rowGap="3"
                fontSize={{ base: '16px', md: '17px' }}
                fontWeight="700"
                color="#FF6900"
              >
                <Link href="https://www.instagram.com" target="_blank">
                  Instagram
                </Link>
                <Link href="https://kr.linkedin.com" target="_blank">
                  LinkedIn
                </Link>
              </HStack>

              <Text mt="8" fontSize="13px" lineHeight="1.8" color="#9CA3AF">
                {partnerLabels.join(' ')}
              </Text>

              <Box mt="8" position="relative">
                <Select.Root
                  collection={familySiteCollection}
                  size="sm"
                  onValueChange={(details) => {
                    const nextHref = details.value[0];
                    if (!nextHref) return;
                    window.open(nextHref, '_blank', 'noopener,noreferrer');
                  }}
                >
                  <Select.HiddenSelect />
                  <Select.Control h="52px" rounded="xl" borderWidth="1px" borderColor="#E5E7EB" bg="white">
                    <Select.Trigger px="4" fontSize="14px" fontWeight="600" color="#9CA3AF">
                      <Select.ValueText placeholder="Family Site" />
                    </Select.Trigger>
                    <Select.IndicatorGroup right="4">
                      <Select.Indicator color="#9CA3AF">
                        <ChevronDown size={16} />
                      </Select.Indicator>
                    </Select.IndicatorGroup>
                  </Select.Control>
                  <Select.Positioner>
                    <Select.Content rounded="xl" borderWidth="1px" borderColor="#E5E7EB" bg="white" p="1.5" boxShadow="0 16px 32px rgba(15, 23, 42, 0.08)">
                      {familySites.map((site) => (
                        <Select.Item
                          key={site.href}
                          item={site}
                          rounded="lg"
                          px="3"
                          py="2.5"
                          fontSize="14px"
                          color="#374151"
                          _highlighted={{ bg: '#FFF4E8', color: '#FF6900' }}
                        >
                          <Select.ItemText>{site.label}</Select.ItemText>
                        </Select.Item>
                      ))}
                    </Select.Content>
                  </Select.Positioner>
                </Select.Root>
              </Box>
            </Box>
          </Grid>
        </Box>
      </Box>
    </Box>
  );
}
