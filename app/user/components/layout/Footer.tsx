import Link from 'next/link';
import {
  Box,
  Button,
  Flex,
  HStack,
  Text,
} from '@chakra-ui/react';
import { ChevronRight, ChevronDown } from 'lucide-react';

export default function Footer() {
  return (
    <Box as="footer" mt="16" borderTopWidth="1px" borderColor="gray.200" bg="white">
      <Box bg="#ff5a1f">
        <Flex
          mx="auto"
          maxW="1200px"
          align="center"
          justify="space-between"
          gap="4"
          px={{ base: '4', sm: '6', lg: '8' }}
          py="4"
        >
          <HStack gap="3" color="white">
            <Flex
              h="7"
              w="7"
              align="center"
              justify="center"
              rounded="sm"
              borderWidth="1px"
              borderColor="whiteAlpha.700"
            >
              <Text fontSize="sm">⌄</Text>
            </Flex>
            <Text fontSize={{ base: 'base', sm: '17px' }} fontWeight="600">
              오렌지플래닛 뉴스레터 구독하기
            </Text>
          </HStack>

          <Button
            type="button"
            display="inline-flex"
            h="12"
            alignItems="center"
            gap="4"
            rounded="full"
            bg="white"
            px="5"
            fontSize="sm"
            fontWeight="600"
            color="#ff5a1f"
            boxShadow="sm"
            transition="transform 0.2s"
            _hover={{ transform: 'scale(1.02)', bg: 'white' }}
          >
            <Text display={{ base: 'none', sm: 'inline' }}>바로가기</Text>
            <Flex h="8" w="8" align="center" justify="center" rounded="full" bg="#ff5a1f" fontSize="lg" color="white">
              <ChevronRight size={16} />
            </Flex>
          </Button>
        </Flex>
      </Box>

      <Box mx="auto" maxW="1200px" px={{ base: '4', sm: '6', lg: '8' }} py="10">
        <Flex direction={{ base: 'column', md: 'row' }} align={{ md: 'flex-start' }} justify="space-between" gap="10">
          <Box maxW="620px">
            <Text
              mb="5"
              fontSize={{ base: '2xl', sm: '36px', md: '40px' }}
              lineHeight={{ sm: 'none' }}
              fontWeight="700"
              color="#ff5a1f"
            >
              재단법인 오렌지플래닛
            </Text>

            <Box display="flex" flexDirection="column" gap="1.5" fontSize={{ base: 'sm', sm: 'base' }} lineHeight="6" color="#ff5a1f">
              <Text>서울 강남구 테헤란로 217 오렌지플래닛 2~6F</Text>
              <Text>사업자번호 : 151-82-00395 센터번호 : 02-2192-5297</Text>
            </Box>

            <Text mt="6" fontSize={{ base: 'sm', sm: 'base' }} lineHeight="6" color="#ff5a1f">
              Copyright 2024© ORANGE PLANET FOUNDATION. All rights reserved.
            </Text>
          </Box>

          <Box w="full" maxW="340px">
            <Flex wrap="wrap" align="center" columnGap="5" rowGap="3" fontSize={{ base: 'sm', sm: 'base' }} fontWeight="600" color="#ff5a1f">
              <Link href="#">서비스 이용약관</Link>
              <Link href="#" style={{ color: '#111827' }}>
                개인정보 처리방침
              </Link>
            </Flex>

            <Flex mt="6" wrap="wrap" align="center" columnGap="6" rowGap="3" fontSize={{ base: 'sm', sm: '17px' }} fontWeight="600" color="#ff5a1f">
              <Link href="#">Instagram</Link>
              <Link href="#">LinkedIn</Link>
            </Flex>

            <Box mt="8" position="relative">
              <Box
                as="select"
                h="12"
                w="full"
                appearance="none"
                rounded="xl"
                borderWidth="1px"
                borderColor="gray.300"
                bg="white"
                px="4"
                pr="10"
                fontSize="sm"
                color="gray.400"
                defaultValue=""
              >
                <option value="" disabled>
                  Family Site
                </option>
                <option value="orange-planet">Orange Planet</option>
              </Box>
              <Flex
                pointerEvents="none"
                position="absolute"
                top="50%"
                right="4"
                transform="translateY(-50%)"
                color="gray.500"
              >
                <ChevronDown size={16} />
              </Flex>
            </Box>
          </Box>
        </Flex>
      </Box>
    </Box>
  );
}
