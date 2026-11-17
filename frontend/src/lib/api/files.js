import { apiClient } from '@/lib/api/client';

/**
 * 에디터에 삽입할 이미지 파일을 백엔드에 업로드한다.
 *
 * @param {File} file 업로드할 이미지 파일
 * @returns {Promise<{ url: string, originalName: string, storedName: string, contentType: string, size: number, image: boolean }>} 업로드 결과
 */
export function uploadImageFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/files/images', formData);
}

/**
 * 게시글에 첨부할 일반 파일을 백엔드에 업로드한다.
 *
 * @param {File} file 업로드할 파일
 * @returns {Promise<{ url: string, originalName: string, storedName: string, contentType: string, size: number, image: boolean }>} 업로드 결과
 */
export function uploadAttachmentFile(file) {
  const formData = new FormData();
  formData.append('file', file);
  return apiClient.post('/files', formData);
}

/**
 * 바이트 단위 파일 크기를 읽기 쉬운 문자열로 변환한다.
 *
 * @param {number} bytes 파일 크기(바이트)
 * @returns {string} 포맷된 크기 문자열
 */
export function formatFileSize(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return '0 B';
  }
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / 1024 ** index;
  return `${value >= 10 || index === 0 ? Math.round(value) : value.toFixed(1)} ${units[index]}`;
}
