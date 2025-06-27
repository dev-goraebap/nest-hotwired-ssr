/**
 * Attachment 인터페이스
 * 
 * 파일과 모델 간의 관계를 정의하는 인터페이스
 * Rails Active Storage의 active_storage_attachments 테이블과 동일한 구조
 * 
 * @example
 * // has_one_attached :avatar
 * { name: 'avatar', recordType: 'User', recordId: '123', attachmentType: 'single' }
 * 
 * // has_many_attached :documents  
 * { name: 'documents', recordType: 'User', recordId: '123', attachmentType: 'multiple' }
 */
export interface IAttachment {
  id: string; // 고유키
  name: string; // attachment 이름 (avatar, documents 등)
  recordType: string; // 연결된 모델명 (User, Post 등)
  recordId: string;  // 연결된 레코드 ID
  blobId: string; // 실제 파일 정보 참조 (IBlob의 id)
  attachmentType: 'single' | 'multiple'; // 첨부파일 타입 (Rails는 메타프로그래밍으로 처리하지만, TypeScript에서는 명시적으로 설정)
  createdAt: Date; // 생성 시간
}