/** @type {import('next').NextConfig} */

// 백엔드 오리진은 소스에 하드코딩하지 않고 .env 의 BACKEND_ORIGIN 으로만 주입한다.
// (환경별로 다르고, 운영 주소를 레포에 남기지 않기 위함. 백엔드 HTTPS 전환 시 .env 만 교체)
// 누락 시 destination 이 "undefined/..." 가 되어 조용히 깨지므로 명시적으로 실패시킨다.
// 값 끝의 슬래시는 제거해 destination 이 "origin//api/v1/..." 로 이중 슬래시가 되지 않게 한다.
const BACKEND_ORIGIN = process.env.BACKEND_ORIGIN?.replace(/\/+$/, '');
if (!BACKEND_ORIGIN) {
  throw new Error(
    'BACKEND_ORIGIN 환경변수가 설정되지 않았습니다. .env(.env.example 참고)에 BACKEND_ORIGIN 을 지정하세요.',
  );
}

const nextConfig = {
  /* config options here */
  reactCompiler: true,

  // 클라이언트(브라우저)는 same-origin 인 /api/v1 로만 요청하고,
  // 실제 백엔드로의 포워딩은 여기 프록시가 서버 측에서 처리한다.
  // → CORS 불필요 + (프론트 HTTPS / 백엔드 HTTP) mixed-content 회피.
  // beforeFiles 에 두는 이유: src/app/api/v1/* route handler 보다 먼저 적용되어 프록시가 우선되도록.
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/v1/:path*',
          destination: `${BACKEND_ORIGIN}/api/v1/:path*`,
        },
      ],
    };
  },
};

export default nextConfig;
