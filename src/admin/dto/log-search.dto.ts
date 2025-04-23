import { IsDateString, IsIn, IsNotEmpty, IsOptional, MinLength } from 'class-validator';

export class LogSearchDto {
  @IsDateString()
  @IsNotEmpty({ message: '날짜를 선택해주세요.' })
  readonly date: string;

  @IsNotEmpty({ message: '검색어를 입력해주세요.' })
  @MinLength(2, { message: '검색어는 2글자 이상 입력해주세요.' })
  readonly keyword: string;
  
  @IsOptional()
  @IsIn(['all', 'INFO', 'ERROR', 'WARN', 'DEBUG'], {
    message: '유효한 로그 레벨이 아닙니다.'
  })
  logLevel: 'all' | 'INFO' | 'ERROR' | 'WARN' | 'DEBUG' = 'all';
}