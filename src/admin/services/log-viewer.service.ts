import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';

import { Result } from '../common/result';
import { LogSearchDto } from '../dto/log-search.dto';

export interface LogEntry {
  content: string;   // 로그 전체 내용
  level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';  // 로그 레벨
  timestamp: string; // 로그 타임스탬프
}

@Injectable()
export class LogViewerService {
  private readonly logDir = path.join(process.cwd(), 'logs');

  /**
   * 로그 파일을 검색하여 키워드가 포함된 로그 단락을 찾습니다.
   */
  async searchLogs(searchDto: LogSearchDto): Promise<Result<LogEntry[]>> {
    try {
      const { date, keyword, logLevel } = searchDto;

      // 날짜 형식 변환 (YYYY-MM-DD)
      const formattedDate = date.replace(/\//g, '-');

      // 날짜에 해당하는 파일명 생성
      const fileName = `application-${formattedDate}.log`;
      const filePath = path.join(this.logDir, 'application', fileName);

      // 파일 존재 여부 확인
      try {
        await fs.access(filePath);
      } catch (error) {
        return Result.failure(
          `${formattedDate} 날짜의 로그 파일이 존재하지 않습니다.`,
        );
      }

      // 파일 내용 읽기
      const fileContent = await fs.readFile(filePath, 'utf8');
      
      // 로그 형식에 따른 처리
      const logEntries = this.parseLogContent(fileContent, keyword, logLevel);

      if (logEntries.length === 0) {
        const logLevelText = logLevel !== 'all' ? `(${logLevel} 로그에서)` : '';
        return Result.failure(
          `'${keyword}' 키워드를 포함하는 로그가 없습니다. ${logLevelText}`,
        );
      }

      const logLevelText = logLevel !== 'all' ? `(${logLevel} 로그)` : '';
      return Result.success(
        logEntries,
        `${logEntries.length}개의 로그 항목을 찾았습니다. ${logLevelText}`,
      );
    } catch (error) {
      return Result.failure(
        `로그 검색 중 오류가 발생했습니다: ${error.message}`,
      );
    }
  }
  
  /**
   * 로그 내용을 파싱하여 키워드가 포함된 로그 단락을 찾습니다.
   */
  private parseLogContent(content: string, keyword: string, logLevel: string = 'all'): LogEntry[] {
    const logEntries: LogEntry[] = [];
    
    // 로그 패턴 매칭을 위한 정규식
    // 날짜로 시작하는 줄을 단락의 시작으로 간주
    const logPattern = /^(\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2})\s\[(INFO|ERROR|WARN|DEBUG)\]/m;
    
    // 로그 내용을 줄 단위로 분리
    const lines = content.split('\n');
    
    let currentEntry: {
      content: string[];
      level: 'INFO' | 'ERROR' | 'WARN' | 'DEBUG';
      timestamp: string;
    } | null = null;
    
    // 각 줄에 대해 처리
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(logPattern);
      
      // 새로운 로그 단락이 시작되는 경우
      if (match) {
        // 이전 로그 단락이 있고 키워드를 포함하는 경우 저장
        if (currentEntry && 
            currentEntry.content.join('\n').toLowerCase().includes(keyword.toLowerCase())) {
          // 로그 레벨에 따른 필터링
          if (logLevel === 'all' || currentEntry.level === logLevel) {
            logEntries.push({
              content: currentEntry.content.join('\n'),
              level: currentEntry.level,
              timestamp: currentEntry.timestamp
            });
          }
        }
        
        // 새로운 로그 단락 시작
        currentEntry = {
          content: [line],
          level: match[2] as 'INFO' | 'ERROR' | 'WARN' | 'DEBUG',
          timestamp: match[1]
        };
      } 
      // 현재 로그 단락에 줄 추가
      else if (currentEntry) {
        currentEntry.content.push(line);
      }
    }
    
    // 마지막 로그 단락 처리
    if (currentEntry && 
        currentEntry.content.join('\n').toLowerCase().includes(keyword.toLowerCase())) {
      if (logLevel === 'all' || currentEntry.level === logLevel) {
        logEntries.push({
          content: currentEntry.content.join('\n'),
          level: currentEntry.level,
          timestamp: currentEntry.timestamp
        });
      }
    }
    
    return logEntries;
  }
}