// 백엔드 공통 응답 envelope({ code, message, data, errors }) 해석 유틸.
// 순수 함수만 — axios/토큰에 의존하지 않는다. envelope 포맷이 바뀌면 이 파일만 고치면 된다.

// 응답 body 가 envelope 형태인지 판별.
export function isEnvelope(body) {
  return body && typeof body === "object" && "code" in body;
}

// envelope 실패 응답을 호출부 try/catch 에 잡히는 Error 로 변환한다.
// message/code/errors/status 를 일관되게 부착 — 성공·에러 인터셉터 양쪽에서 재사용한다.
export function createApiError(body, status) {
  const error = new Error(body.message ?? "API 요청에 실패했습니다.");
  error.code = body.code;
  error.errors = body.errors ?? null;
  error.status = status;
  return error;
}
