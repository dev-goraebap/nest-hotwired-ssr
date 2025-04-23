import { Controller, Get, Query, Render } from '@nestjs/common';
import { LogSearchDto } from '../dto/log-search.dto';
import { LogViewerService } from '../services/log-viewer.service';

@Controller({ path: '/admin/logs' })
export class LogViewerController {
  constructor(private readonly logViewerService: LogViewerService) {}

  @Get()
  @Render('log-viewer/index')
  async index(@Query() query: LogSearchDto) {
    // 기본값 설정
    const today = new Date().toISOString().split('T')[0]; // 오늘 날짜
    
    // 검색 파라미터가 있는지 확인
    const hasSearchParams = query && query.date && query.keyword;
    
    // 검색 파라미터가 없는 경우 빈 폼만 표시
    if (!hasSearchParams) {
      return {
        result: null,
        searchDate: today,
        helpers: {
          getLogLevelStyle: this.getLogLevelStyle,
        },
      };
    }
    
    // 검색 로직 실행
    const result = await this.logViewerService.searchLogs({
      date: query.date,
      keyword: query.keyword, 
      logLevel: query.logLevel || 'all'
    });

    return {
      result,
      searchParams: query,
      searchDate: query.date || today,
      helpers: {
        getLogLevelStyle: this.getLogLevelStyle,
      },
    };
  }

  private getLogLevelStyle(level) {
    switch (level) {
      case 'ERROR':
        return {
          borderClass: 'border-red-500 bg-red-50',
          bgClass: 'bg-red-200',
          textClass: 'text-red-700',
        };
      case 'WARN':
        return {
          borderClass: 'border-yellow-500 bg-yellow-50',
          bgClass: 'bg-yellow-200',
          textClass: 'text-yellow-700',
        };
      case 'DEBUG':
        return {
          borderClass: 'border-purple-500 bg-purple-50',
          bgClass: 'bg-purple-200',
          textClass: 'text-purple-700',
        };
      case 'INFO':
      default:
        return {
          borderClass: 'border-blue-500 bg-blue-50',
          bgClass: 'bg-blue-200',
          textClass: 'text-blue-700',
        };
    }
  }
}