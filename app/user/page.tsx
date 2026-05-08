'use client';

import Link from 'next/link';
import { Box, Button, Flex, Grid, Heading, Text } from '@chakra-ui/react';

export default function UserHomePage() {
  return (
    <Flex minH="100vh" bg="linear-gradient(180deg, #FFF7ED 0%, #FFFFFF 38%, #F9FAFB 100%)" align="center" justify="center" px="16px" py="32px">
      <Box w="100%" maxW="1120px">
        <Grid gap="24px" templateColumns={{ base: '1fr', lg: '1.15fr 0.85fr' }} alignItems="stretch">
          <Box
            borderWidth="1px"
            borderColor="rgba(249, 115, 22, 0.12)"
            borderRadius={{ base: '28px', md: '32px' }}
            bg="rgba(255,255,255,0.9)"
            backdropFilter="blur(8px)"
            boxShadow="0 24px 64px rgba(15, 23, 42, 0.08)"
            px={{ base: '24px', md: '40px' }}
            py={{ base: '28px', md: '40px' }}
          >
            <Text
              display="inline-flex"
              alignItems="center"
              gap="8px"
              px="12px"
              py="6px"
              borderRadius="9999px"
              bg="#FFF7ED"
              color="#C2410C"
              fontSize="12px"
              fontWeight="700"
              letterSpacing="0.04em"
              textTransform="uppercase"
            >
              Orange Park User
            </Text>

            <Heading
              as="h1"
              mt="20px"
              fontSize={{ base: '34px', md: '48px' }}
              lineHeight={{ base: '1.15', md: '1.08' }}
              letterSpacing="-0.03em"
              color="#111827"
            >
              커뮤니티와 마이페이지를
              <br />
              실제 서비스 화면 기준으로
              <br />
              이어가고 있습니다.
            </Heading>

            <Text mt="18px" maxW="560px" fontSize={{ base: '15px', md: '17px' }} lineHeight="1.8" color="#6B7280">
              현재 user 영역은 Chakra UI 기준으로 재정비 중이며, 커뮤니티 메인·상세·마이페이지
              핵심 흐름은 이미 새로운 화면 구조로 정리되어 있습니다.
            </Text>

            <Flex mt="28px" wrap="wrap" gap="12px">
              <Button
                asChild
                h="46px"
                px="18px"
                borderRadius="14px"
                bg="#F97316"
                color="#FFFFFF"
                fontSize="14px"
                fontWeight="700"
                _hover={{ bg: '#EA580C' }}
              >
                <Link href="/user/community">커뮤니티 바로가기</Link>
              </Button>
              <Button
                asChild
                h="46px"
                px="18px"
                borderRadius="14px"
                borderWidth="1px"
                borderColor="#E5E7EB"
                bg="#FFFFFF"
                color="#374151"
                fontSize="14px"
                fontWeight="700"
                _hover={{ bg: '#F9FAFB' }}
              >
                <Link href="/user/mypage/community">마이페이지 보기</Link>
              </Button>
            </Flex>
          </Box>

          <Grid gap="16px">
            <Box
              borderWidth="1px"
              borderColor="#E5E7EB"
              borderRadius="24px"
              bg="#FFFFFF"
              px="22px"
              py="22px"
              boxShadow="0 16px 40px rgba(15, 23, 42, 0.05)"
            >
              <Text fontSize="13px" fontWeight="700" color="#F97316">
                진행 상태
              </Text>
              <Text mt="10px" fontSize="20px" fontWeight="700" color="#111827">
                커뮤니티 중심 화면은 Chakra 기준으로 상당 부분 정리되었습니다.
              </Text>
              <Text mt="10px" fontSize="14px" lineHeight="1.8" color="#6B7280">
                메인, 상세, 작성자 페이지, 마이페이지와 설정 화면까지 같은 UI 결로 맞춰가고 있습니다.
              </Text>
            </Box>

            <Box
              borderWidth="1px"
              borderColor="#E5E7EB"
              borderRadius="24px"
              bg="#111827"
              px="22px"
              py="22px"
              color="#FFFFFF"
              boxShadow="0 16px 40px rgba(15, 23, 42, 0.08)"
            >
              <Text fontSize="13px" fontWeight="700" color="#FDBA74">
                현재 기준
              </Text>
              <Text mt="10px" fontSize="20px" fontWeight="700">
                admin과 같은 mock 데이터를 바라보는 구조로 맞춰져 있습니다.
              </Text>
              <Text mt="10px" fontSize="14px" lineHeight="1.8" color="rgba(255,255,255,0.72)">
                이후 실제 서비스 연결 시에도 화면 구조를 크게 흔들지 않고 이어갈 수 있도록 준비해두었습니다.
              </Text>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </Flex>
  );
}
