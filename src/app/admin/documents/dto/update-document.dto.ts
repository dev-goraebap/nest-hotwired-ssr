import { z } from 'zod';

export const UpdateDocumentSchema = z.object({
  title: z.string().optional(),
  content: z.string().min(1, '내용을 입력해주세요.').optional(),
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
    })
    .optional(),
  category: z
    .object({
      id: z.string().transform(Number),
    })
    .optional(),
});

export type UpdateDocumentDto = z.infer<typeof UpdateDocumentSchema>;
