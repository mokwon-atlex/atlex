import "./post-write-page.css";
import RequireAuth from "@/components/common/auth/RequireAuth";

// 글쓰기 라우트는 로그인 사용자만 접근할 수 있다.
// RequireAuth(클라이언트 가드)가 미로그인 시 /account 로 리다이렉트한다.
export default function PostWritePageLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
