import { z } from 'zod';

const extractH1Content = (content: string): string | undefined => {
  const match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
  return match ? match[1].trim() : undefined;
};

export const CreateDocumentSchema = z
  .object({
    title: z.string().optional(),
    content: z.string().min(1, '내용을 입력해주세요.'),
    slug: z
      .string()
      .min(1, '슬러그를 입력해주세요.')
      .refine((val) => val === val.toLowerCase(), {
        message: '슬러그는 소문자만 허용됩니다.',
      })
      .refine((val) => !/\s/.test(val), {
        message: '슬러그에 공백이 포함될 수 없습니다.',
      })
      // eslint-disable-next-line no-useless-escape
      .refine((val) => /^[a-z0-9\-\/]+$/.test(val), {
        message:
          '슬러그는 영문 소문자, 숫자, 하이픈(-), 슬래시(/)만 사용할 수 있습니다.',
      }),
    category: z.object({
      id: z.string().transform(Number),
    }),
  })
  .transform((data) => {
    return {
      ...data,
      title: data.title ?? (extractH1Content(data.content) as string),
      categoryId: data.category.id,
    };
  })
  .refine((data) => data.title && data.title.length > 0, {
    message: '제목은 content 필드에 h1 태그를 이용하여 입력해주셔야 합니다.',
    path: ['title'],
  });

export type CreateDocumentDto = z.infer<typeof CreateDocumentSchema>;
