import { NextResponse } from 'next/server';

export function proxy(request) {
  const pathname = request.nextUrl.pathname;

  // /u/* 로의 직접 접근(외부 요청)은 canonical 인 /@* 로 308 redirect 한다.
  // 아래 /@ rewrite 는 x-handle-prefix 헤더를 달고 들어오므로 그 내부 요청은 통과시킨다.
  // → 직접 접근 차단/정규화를 미들웨어 한 곳에서 처리(페이지별 헤더 체크 불필요),
  //   /u/* 하위 라우트(상세 등)가 늘어나도 일관 적용 + SEO 중복 콘텐츠 방지.
  if (pathname.startsWith('/u/') && !request.headers.get('x-handle-prefix')) {
    const url = request.nextUrl.clone();
    url.pathname = '/@' + pathname.slice(3);
    return NextResponse.redirect(url, 308);
  }

  // /@username 핸들은 전용 네임스페이스(/u/*)로 rewrite 한다.
  // 최상위 정적 라우트(/test, /account, /write ...)와 username 이 충돌하지 않도록 분리.
  // 공개 URL(/@username)은 그대로 유지되고, 내부 라우팅만 app/u/[username] 으로 향한다.
  if (pathname.startsWith('/@')) {
    const url = request.nextUrl.clone();
    url.pathname = '/u/' + pathname.slice(2);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-handle-prefix', '1');
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
