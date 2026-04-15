import { NextRequest, NextResponse } from 'next/server';

import { readJsonFile, writeJsonFile } from '@/lib/mock-file';
import type { Tag } from '@/types/tag';

const TAGS_PATH = 'data/mock/tags.json';

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function DELETE(_: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const tags = await readJsonFile<Tag[]>(TAGS_PATH);

    const targetTag = tags.find((tag) => tag.id === id);
    if (!targetTag) {
      return NextResponse.json(
        { message: '삭제할 태그를 찾지 못했습니다.' },
        { status: 404 },
      );
    }

    if (targetTag.isDefault) {
      return NextResponse.json(
        { message: '고정 태그는 삭제할 수 없습니다.' },
        { status: 400 },
      );
    }

    const nextTags = tags
      .filter((tag) => tag.id !== id)
      .map((tag, index) => ({
        ...tag,
        sortOrder: index + 1,
      }));

    await writeJsonFile<Tag[]>(TAGS_PATH, nextTags);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('[DELETE /api/mock/tags/[id]] failed:', error);
    return NextResponse.json(
      { message: '태그를 삭제하지 못했습니다.' },
      { status: 500 },
    );
  }
}

type UpdateTagRequestBody = Partial<{
  name: string;
  textColor: string;
  bgColor: string;
  status: Tag['status'];
  sortOrder: number;
}>;

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = (await request.json()) as UpdateTagRequestBody;
    const tags = await readJsonFile<Tag[]>(TAGS_PATH);

    const targetIndex = tags.findIndex((tag) => tag.id === id);
    if (targetIndex === -1) {
      return NextResponse.json(
        { message: '수정할 태그를 찾지 못했습니다.' },
        { status: 404 },
      );
    }

    const targetTag = tags[targetIndex];
    const nextName = body.name?.trim();

    if (body.name !== undefined && !nextName) {
      return NextResponse.json(
        { message: '태그명은 필수입니다.' },
        { status: 400 },
      );
    }

    if (nextName) {
      const normalizedName = nextName.toLowerCase();
      const hasDuplicate = tags.some(
        (tag) => tag.id !== id && tag.name.trim().toLowerCase() === normalizedName,
      );

      if (hasDuplicate) {
        return NextResponse.json(
          { message: '동일한 이름의 태그가 이미 존재합니다.' },
          { status: 409 },
        );
      }
    }

    const resolvedName = nextName || targetTag.name;
    const slugBase = resolvedName
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9\-가-힣]/g, '');

    const updatedTag: Tag = {
      ...targetTag,
      name: resolvedName,
      slug: slugBase || targetTag.slug,
      status: body.status ?? targetTag.status,
      sortOrder: body.sortOrder ?? targetTag.sortOrder,
      style: {
        textColor: body.textColor?.trim() || targetTag.style.textColor,
        bgColor: body.bgColor?.trim() || targetTag.style.bgColor,
      },
      updatedAt: new Date().toISOString(),
    };

    const nextTags = [...tags];
    nextTags[targetIndex] = updatedTag;

    await writeJsonFile<Tag[]>(TAGS_PATH, nextTags);

    return NextResponse.json(updatedTag, { status: 200 });
  } catch (error) {
    console.error('[PATCH /api/mock/tags/[id]] failed:', error);
    return NextResponse.json(
      { message: '태그를 수정하지 못했습니다.' },
      { status: 500 },
    );
  }
}
