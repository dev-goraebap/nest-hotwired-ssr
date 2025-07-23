import { Controller } from '@hotwired/stimulus';

export class TagInputController extends Controller {
  static targets = ["input", "frame", "tagContainer", "hiddenInput"]
  static values = { 
    searchUrl: String,
    debounceDelay: { type: Number, default: 300 }
  }

  connect() {
    this.debounceTimer = null;
    this.selectedTags = new Map(); // tagId -> {id, name}
    
    // Turbo Frame 내부의 동적 콘텐츠에 대한 이벤트 위임
    this.frameTarget.addEventListener('click', this.handleTagClick.bind(this));
    
    // 초기 숨겨진 input 값 로드 (기존 태그가 있는 경우)
    this.loadExistingTags();
  }

  disconnect() {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
  }

  search() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      const keyword = this.inputTarget.value.trim();
      if (keyword.length >= 2) {
        // Turbo Frame의 src를 변경하면 자동으로 해당 URL을 호출하여 내용 교체
        this.frameTarget.src = `${this.searchUrlValue}?keyword=${encodeURIComponent(keyword)}`;
      } else {
        this.clearSearchResults();
      }
    }, this.debounceDelayValue);
  }

  handleKeydown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      const keyword = this.inputTarget.value.trim();
      if (keyword.length > 0) {
        this.createNewTag(keyword);
      }
    } else if (event.key === 'Escape') {
      this.clearSearchResults();
      this.inputTarget.blur();
    }
  }

  handleTagClick(event) {
    const tagItem = event.target.closest('[data-tag-id]');
    if (tagItem) {
      event.preventDefault();
      const tagId = tagItem.dataset.tagId;
      const tagName = tagItem.dataset.tagName;
      
      this.addTag({ id: tagId, name: tagName });
      this.clearInput();
      this.clearSearchResults();
    }
  }

  addTag(tagData) {
    // 중복 체크
    if (this.selectedTags.has(tagData.id)) {
      return;
    }

    // 태그 데이터 저장
    this.selectedTags.set(tagData.id, tagData);

    // DOM에 태그 엘리먼트 추가
    const tagElement = this.createTagElement(tagData);
    this.tagContainerTarget.appendChild(tagElement);

    // 숨겨진 input 업데이트
    this.updateHiddenInput();
  }

  removeTag(event) {
    event.preventDefault();
    const tagElement = event.target.closest('[data-selected-tag-id]');
    const tagId = tagElement.dataset.selectedTagId;

    // 데이터에서 제거
    this.selectedTags.delete(tagId);

    // DOM에서 제거
    tagElement.remove();

    // 숨겨진 input 업데이트
    this.updateHiddenInput();
  }

  async createNewTag(tagName) {
    // 새 태그는 임시 ID로 생성 (서버에서 실제 ID 할당)
    const tempId = `temp_${Date.now()}`;
    const tagData = { id: tempId, name: tagName, isNew: true };
    
    this.addTag(tagData);
    this.clearInput();
    this.clearSearchResults();
  }

  createTagElement(tagData) {
    const tagElement = document.createElement('span');
    tagElement.className = 'inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm mr-2 mb-2';
    tagElement.dataset.selectedTagId = tagData.id;
    
    tagElement.innerHTML = `
      <span>${this.escapeHtml(tagData.name)}</span>
      ${tagData.isNew ? '<span class="text-xs opacity-70">(새 태그)</span>' : ''}
      <button type="button" 
              class="ml-1 text-blue-600 hover:text-blue-800" 
              data-action="click->tag-input#removeTag">×</button>
    `;

    return tagElement;
  }

  clearInput() {
    this.inputTarget.value = '';
  }

  clearSearchResults() {
    this.frameTarget.innerHTML = '';
    this.frameTarget.removeAttribute('src');
  }

  updateHiddenInput() {
    const tagIds = Array.from(this.selectedTags.keys());
    this.hiddenInputTarget.value = JSON.stringify(tagIds);
  }

  loadExistingTags() {
    // 폼 편집 시 기존 태그 로드 로직
    try {
      const existingValue = this.hiddenInputTarget.value;
      if (existingValue) {
        const tagIds = JSON.parse(existingValue);
        // 실제 구현에서는 서버에서 태그 정보를 가져와야 함
        // 지금은 스킵
      }
    } catch (error) {
      console.warn('기존 태그 로드 실패:', error);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}