import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { IpWhitelistEntity } from "../entities/ip-whitelist.entity";
import { Result } from "../common/result";

@Injectable()
export class IpWhitelistService {
  constructor(
    @InjectRepository(IpWhitelistEntity)
    private ipWhitelistRepository: Repository<IpWhitelistEntity>,
  ) {}

  /**
   * 모든 IP 화이트리스트 항목을 가져옵니다.
   */
  async findAll(): Promise<Result<IpWhitelistEntity[]>> {
    try {
      const ipList = await this.ipWhitelistRepository.find({
        order: { createdAt: 'DESC' },
      });
      
      return Result.success(ipList);
    } catch (error) {
      return Result.failure('IP 화이트리스트를 가져오는 중 오류가 발생했습니다.');
    }
  }

  /**
   * 새로운 IP 주소를 화이트리스트에 추가합니다.
   */
  async create(ip: string, description?: string): Promise<Result<IpWhitelistEntity>> {
    try {
      // IP 형식 검증
      if (!this.isValidIpAddress(ip)) {
        return Result.failure('유효하지 않은 IP 주소 형식입니다.');
      }
      
      // 이미 존재하는 IP인지 확인
      const existingIp = await this.ipWhitelistRepository.findOne({ 
        where: { ip } 
      });
      
      if (existingIp) {
        return Result.failure('이미 등록된 IP 주소입니다.');
      }
      
      // 새 IP 주소 저장
      const newIp = this.ipWhitelistRepository.create({
        ip,
        description: description || ''
      });
      
      await this.ipWhitelistRepository.save(newIp);
      
      return Result.success(newIp, 'IP 주소가 성공적으로 등록되었습니다.');
    } catch (error) {
      return Result.failure(`IP 주소 등록 중 오류가 발생했습니다: ${error.message}`);
    }
  }

  /**
   * IP 주소를 화이트리스트에서 삭제합니다.
   */
  async delete(ip: string): Promise<Result<void>> {
    try {
      const result = await this.ipWhitelistRepository.delete({ ip });
      
      if (result.affected === 0) {
        return Result.failure('삭제할 IP 주소를 찾을 수 없습니다.');
      }
      
      return Result.success(null, 'IP 주소가 성공적으로 삭제되었습니다.');
    } catch (error) {
      return Result.failure(`IP 주소 삭제 중 오류가 발생했습니다: ${error.message}`);
    }
  }
  
  /**
   * IP 주소 형식이 유효한지 확인합니다.
   */
  private isValidIpAddress(ip: string): boolean {
    // IPv4 형식 검증 정규식
    const ipv4Regex = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ip.match(ipv4Regex);
    
    if (!match) return false;
    
    // 각 숫자가 0-255 범위인지 확인
    for (let i = 1; i <= 4; i++) {
      const octet = parseInt(match[i], 10);
      if (octet < 0 || octet > 255) return false;
    }
    
    return true;
  }
}