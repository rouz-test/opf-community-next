import { NextRequest, NextResponse } from 'next/server';

import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { Tag } from '@/types/tag';

const TAGS_PATH = 'data/mock/tags.json';

type CreateTagRequestBody = Partial<{
  name: string;
  textColor: string;
  bgColor: string;
}>;

export async function GET() {
  try {
    const tags = await readJsonFile<Tag[]>(TAGS_PATH);
    return NextResponse.json(tags, { status: 200 });
  } catch (error) {
    console.error('[GET /api/mock/tags] failed:', error);
    return NextResponse.json(
      { message: '태그 목록을 불러오지 못했습니다.' },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreateTagRequestBody;

    const name = body.name?.trim();
    if (!name) {
      return NextResponse.json(
        { message: '태그명은 필수입니다.' },
        { status: 400 },
      );
    }

    const tags = await readJsonFile<Tag[]>(TAGS_PATH);
    const normalizedName = name.toLowerCase();
    const hasDuplicate = tags.some(
      (tag) => tag.name.trim().toLowerCase() === normalizedName,
    );

    if (hasDuplicate) {
      return NextResponse.json(
        { message: '동일한 이름의 태그가 이미 존재합니다.' },
        { status: 409 },
      );
    }

    const now = new Date().toISOString();
    const slugBase = name
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-가-힣]/g, '');

    const newTag: Tag = {
      id: `tag_${Date.now()}`,
      name,
      slug: slugBase || `tag-${Date.now()}`,
      status: 'active',
      isDefault: false,
      sortOrder: tags.length + 1,
      style: {
        textColor: body.textColor?.trim() || '#C2410C',
        bgColor: body.bgColor?.trim() || '#FFEDD5',
      },
      createdAt: now,
      updatedAt: now,
    };

    const nextTags = [...tags, newTag];
    await writeJsonFile<Tag[]>(TAGS_PATH, nextTags);

    return NextResponse.json(newTag, { status: 201 });
  } catch (error) {
    console.error('[POST /api/mock/tags] failed:', error);
    return NextResponse.json(
      { message: '태그를 저장하지 못했습니다.' },
      { status: 500 },
    );
  }
}
