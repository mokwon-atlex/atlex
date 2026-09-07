import RequireAuth from '@/components/common/auth/RequireAuth';

// /option 하위 설정 페이지는 로그인한 사용자만 접근할 수 있게 보호한다.
// App Router의 layout에 감싸 두면 page.jsx를 건드리지 않아도 하위 화면 전체에 적용된다.
export default function OptionPageLayout({ children }) {
  return <RequireAuth>{children}</RequireAuth>;
}
