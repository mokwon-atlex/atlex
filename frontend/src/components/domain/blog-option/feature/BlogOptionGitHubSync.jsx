'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle2, ExternalLink, Github, LoaderCircle, RefreshCw, Trash2, XCircle } from 'lucide-react';

import { Button } from '@/components/common/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/common/ui/card';
import { Field, FieldDescription, FieldError, FieldLabel } from '@/components/common/ui/field';
import { Input } from '@/components/common/ui/input';
import { Switch } from '@/components/common/ui/switch';
import {
  connectGitHub,
  disconnectGitHub,
  fetchGitHubConfig,
  fetchGitHubOAuthUrl,
  fetchGitHubRepositories,
  fetchGitHubSyncLogs,
  retryGitHubSync,
  updateGitHubConfig,
} from '@/lib/api/github';

/**
 * 블로그 설정 내 GitHub 계정 연동 및 저장소 자동 백업 관리 컴포넌트입니다.
 */
export default function BlogOptionGitHubSync() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const oauthCode = searchParams.get('code');

  const [config, setConfig] = useState(null);
  const [repositories, setRepositories] = useState([]);
  const [logs, setLogs] = useState([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [retryingLogId, setRetryingLogId] = useState(null);

  const [repositoryName, setRepositoryName] = useState('');
  const [branchName, setBranchName] = useState('main');
  const [directoryPath, setDirectoryPath] = useState('posts/');
  const [deleteOption, setDeleteOption] = useState('DELETE_FILE');
  const [isEnabled, setIsEnabled] = useState(true);

  const [errorMessage, setErrorMessage] = useState('');
  const [noticeMessage, setNoticeMessage] = useState('');
  const [showLogs, setShowLogs] = useState(false);

  // 초기 설정 및 OAuth 콜백 처리
  useEffect(() => {
    let cancelled = false;

    async function init() {
      setIsLoading(true);
      setErrorMessage('');

      // OAuth 리다이렉트로 인가 코드가 전달된 경우
      if (oauthCode) {
        setIsConnecting(true);
        try {
          const connectedConfig = await connectGitHub(oauthCode);
          if (!cancelled) {
            setConfig(connectedConfig);
            applyConfigToForm(connectedConfig);
            setNoticeMessage('GitHub 계정이 성공적으로 연동되었습니다.');
            // URL에서 code 파라미터 정리
            router.replace('/blog_option');
          }
        } catch (error) {
          if (!cancelled) {
            setErrorMessage(error?.message ?? 'GitHub 연동에 실패했습니다.');
          }
        } finally {
          if (!cancelled) {
            setIsConnecting(false);
          }
        }
      }

      // 기존 설정 불러오기
      try {
        const loadedConfig = await fetchGitHubConfig();
        if (!cancelled) {
          setConfig(loadedConfig);
          applyConfigToForm(loadedConfig);

          if (loadedConfig.isConnected) {
            // 저장소 목록 및 최근 로그 동시 조회
            loadRepositoriesAndLogs();
          }
        }
      } catch (error) {
        if (!cancelled) {
          setErrorMessage(error?.message ?? '설정을 불러오지 못했습니다.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
    };
  }, [oauthCode, router]);

  function applyConfigToForm(cfg) {
    if (!cfg) return;
    setRepositoryName(cfg.repositoryName || '');
    setBranchName(cfg.branchName || 'main');
    setDirectoryPath(cfg.directoryPath || 'posts/');
    setDeleteOption(cfg.deleteOption || 'DELETE_FILE');
    setIsEnabled(cfg.isEnabled !== false);
  }

  async function loadRepositoriesAndLogs() {
    try {
      const [repoList, logList] = await Promise.all([
        fetchGitHubRepositories().catch(() => []),
        fetchGitHubSyncLogs().catch(() => []),
      ]);
      setRepositories(repoList);
      setLogs(logList);
    } catch {
      // 보조 데이터 로드 실패는 폼 작동에 지장을 주지 않음
    }
  }

  // GitHub OAuth 로그인 페이지로 이동
  async function handleStartConnect() {
    setIsConnecting(true);
    setErrorMessage('');
    try {
      const { url } = await fetchGitHubOAuthUrl();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      setErrorMessage(error?.message ?? 'GitHub 로그인 URL을 불러오지 못했습니다.');
      setIsConnecting(false);
    }
  }

  // 설정 저장
  async function handleSaveConfig() {
    setIsSaving(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      const updated = await updateGitHubConfig({
        repositoryName: repositoryName.trim(),
        branchName: branchName.trim() || 'main',
        directoryPath: directoryPath.trim() || 'posts/',
        deleteOption,
        isEnabled,
      });
      setConfig(updated);
      applyConfigToForm(updated);
      setNoticeMessage('GitHub 동기화 설정이 저장되었습니다.');
    } catch (error) {
      setErrorMessage(error?.message ?? '설정 저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  }

  // 연동 해제
  async function handleDisconnect() {
    if (!window.confirm('정말 GitHub 연동을 해제하시겠습니까? 저장된 토큰이 파기됩니다.')) {
      return;
    }

    setIsDisconnecting(true);
    setErrorMessage('');
    setNoticeMessage('');

    try {
      await disconnectGitHub();
      const nextConfig = await fetchGitHubConfig();
      setConfig(nextConfig);
      setRepositories([]);
      setLogs([]);
      setNoticeMessage('GitHub 연동이 안전하게 해제되었습니다.');
    } catch (error) {
      setErrorMessage(error?.message ?? '연동 해제 중 오류가 발생했습니다.');
    } finally {
      setIsDisconnecting(false);
    }
  }

  // 실패 항목 재시도
  async function handleRetry(logId) {
    setRetryingLogId(logId);
    setErrorMessage('');
    try {
      await retryGitHubSync(logId);
      // 로그 및 설정 갱신
      const [nextLogs, nextConfig] = await Promise.all([fetchGitHubSyncLogs(), fetchGitHubConfig()]);
      setLogs(nextLogs);
      setConfig(nextConfig);
      setNoticeMessage('동기화 재시도가 완료되었습니다.');
    } catch (error) {
      setErrorMessage(error?.message ?? '동기화 재시도에 실패했습니다.');
    } finally {
      setRetryingLogId(null);
    }
  }

  return (
    <Card className="rounded-[2rem] border-border/60 bg-card/80 shadow-sm backdrop-blur">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Github className="size-5 text-foreground" />
            <CardTitle>GitHub 마크다운 자동 커밋 백업</CardTitle>
          </div>
          {config?.isConnected ? (
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                config.syncStatus === 'FAILED'
                  ? 'bg-destructive/10 text-destructive'
                  : config.syncStatus === 'SYNCING'
                    ? 'bg-blue-500/10 text-blue-500'
                    : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              {config.syncStatus === 'FAILED' ? (
                <>
                  <XCircle className="size-3.5" /> 오류
                </>
              ) : config.syncStatus === 'SYNCING' ? (
                <>
                  <LoaderCircle className="size-3.5 animate-spin" /> 동기화 중
                </>
              ) : (
                <>
                  <CheckCircle2 className="size-3.5" /> 연동됨
                </>
              )}
            </span>
          ) : null}
        </div>
        <CardDescription>
          글을 발행하거나 수정할 때 개인 GitHub 저장소에 YAML Frontmatter가 포함된 마크다운(.md) 파일로 자동
          커밋·푸시하여 백업 및 GitHub 잔디(기여도)를 누적합니다.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
          <div className="flex items-center justify-center py-10 text-muted-foreground">
            <LoaderCircle className="size-6 animate-spin" />
          </div>
        ) : !config?.isConnected ? (
          /* ── 연동 전 화면 ── */
          <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-border/80 bg-muted/20 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-muted">
              <Github className="size-6 text-foreground" />
            </div>
            <div className="max-w-md space-y-1">
              <p className="font-semibold text-foreground">GitHub 계정이 연동되지 않았습니다</p>
              <p className="text-xs leading-relaxed text-muted-foreground">
                GitHub 계정을 연동하면 글을 쓸 때마다 지정한 저장소에 .md 파일이 자동으로 푸시되며, 작성자 잔디에 커밋이
                기록됩니다.
              </p>
            </div>
            <Button
              type="button"
              className="mt-2 gap-2 rounded-full px-6"
              disabled={isConnecting}
              onClick={handleStartConnect}
            >
              {isConnecting ? (
                <>
                  <LoaderCircle className="size-4 animate-spin" />
                  연동 준비 중...
                </>
              ) : (
                <>
                  <Github className="size-4" />
                  GitHub로 연동하기
                </>
              )}
            </Button>
          </div>
        ) : (
          /* ── 연동 완료 화면 ── */
          <div className="space-y-5">
            {/* 프로필 정보 및 연동 해제 */}
            <div className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-muted/30 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                {config.githubAvatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={config.githubAvatarUrl}
                    alt={config.githubUsername}
                    className="size-10 rounded-full border border-border"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                    <Github className="size-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5 font-semibold text-foreground">
                    <span>@{config.githubUsername}</span>
                    <a
                      href={`https://github.com/${config.githubUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-muted-foreground transition hover:text-foreground"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    잔디 커밋 이메일: <span className="font-mono text-foreground/80">{config.githubEmail}</span>
                  </p>
                </div>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5 rounded-full text-destructive hover:bg-destructive/10"
                disabled={isDisconnecting || isSaving}
                onClick={handleDisconnect}
              >
                {isDisconnecting ? <LoaderCircle className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
                연동 해제
              </Button>
            </div>

            {/* 저장소 선택 */}
            <Field>
              <FieldLabel>동기화 대상 Repository</FieldLabel>
              {repositories.length > 0 ? (
                <div className="space-y-2">
                  <select
                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    value={repositoryName}
                    onChange={(e) => setRepositoryName(e.target.value)}
                    disabled={isSaving}
                  >
                    <option value="">저장소를 선택하세요</option>
                    {repositories.map((repo) => (
                      <option key={repo.fullName} value={repo.fullName}>
                        {repo.fullName} {repo.isPrivate ? '(Private)' : '(Public)'}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <Input
                  variant="outline"
                  placeholder="예: octocat/my-blog-posts"
                  value={repositoryName}
                  onChange={(e) => setRepositoryName(e.target.value)}
                  disabled={isSaving}
                />
              )}
              <FieldDescription>글이 커밋될 사용자의 GitHub 저장소 전체 이름(owner/repo)입니다.</FieldDescription>
            </Field>

            {/* 브랜치 및 디렉터리 경로 */}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field>
                <FieldLabel>브랜치명</FieldLabel>
                <Input
                  variant="outline"
                  placeholder="main"
                  value={branchName}
                  onChange={(e) => setBranchName(e.target.value)}
                  disabled={isSaving}
                />
                <FieldDescription>기본 브랜치 (기여도 그래프 잔디 반영용)</FieldDescription>
              </Field>

              <Field>
                <FieldLabel>디렉터리 경로</FieldLabel>
                <Input
                  variant="outline"
                  placeholder="posts/"
                  value={directoryPath}
                  onChange={(e) => setDirectoryPath(e.target.value)}
                  disabled={isSaving}
                />
                <FieldDescription>저장소 내 파일 저장 폴더 (기본: posts/)</FieldDescription>
              </Field>
            </div>

            {/* 삭제 옵션 */}
            <Field>
              <FieldLabel>게시글 삭제 시 GitHub 처리 옵션</FieldLabel>
              <div className="flex flex-col gap-2 pt-1 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="DELETE_FILE"
                    checked={deleteOption === 'DELETE_FILE'}
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="accent-primary"
                  />
                  <span>GitHub 저장소 내 마크다운 파일도 함께 삭제</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteOption"
                    value="KEEP_FILE"
                    checked={deleteOption === 'KEEP_FILE'}
                    onChange={(e) => setDeleteOption(e.target.value)}
                    className="accent-primary"
                  />
                  <span>Atlex에서 글이 삭제되어도 GitHub 저장소 파일은 유지 (보관)</span>
                </label>
              </div>
            </Field>

            {/* 자동 동기화 활성화 스위치 */}
            <div className="flex items-center justify-between rounded-xl border border-border/70 p-3.5">
              <div>
                <p className="text-sm font-semibold text-foreground">자동 커밋 활성화</p>
                <p className="text-xs text-muted-foreground">글 발행·수정 시 즉시 GitHub에 커밋·푸시합니다.</p>
              </div>
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} disabled={isSaving} />
            </div>

            {/* 최근 동기화 오류 안내 */}
            {config.lastErrorMessage ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                <p className="font-semibold">최근 동기화 실패 사유:</p>
                <p className="mt-1 font-mono break-all">{config.lastErrorMessage}</p>
              </div>
            ) : null}

            {/* 동기화 이력 로그 토글 */}
            {logs.length > 0 ? (
              <div className="space-y-2 border-t border-border/50 pt-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground">최근 동기화 내역 ({logs.length}건)</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setShowLogs(!showLogs)}
                  >
                    {showLogs ? '접기' : '상세보기'}
                  </Button>
                </div>

                {showLogs ? (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {logs.map((logItem) => (
                      <div
                        key={logItem.id}
                        className="flex items-center justify-between rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs"
                      >
                        <div className="space-y-0.5 max-w-[70%]">
                          <p className="font-medium text-foreground truncate">{logItem.postTitle || '게시글'}</p>
                          <p className="text-[11px] text-muted-foreground font-mono truncate">{logItem.targetPath}</p>
                          {logItem.status === 'FAILED' && logItem.errorMessage ? (
                            <p className="text-[11px] text-destructive truncate">{logItem.errorMessage}</p>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                              logItem.status === 'SUCCESS'
                                ? 'bg-emerald-500/10 text-emerald-600'
                                : 'bg-destructive/10 text-destructive'
                            }`}
                          >
                            {logItem.status === 'SUCCESS' ? '성공' : '실패'}
                          </span>
                          {logItem.status === 'FAILED' ? (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-6 px-2 text-[10px] gap-1"
                              disabled={retryingLogId === logItem.id}
                              onClick={() => handleRetry(logItem.id)}
                            >
                              <RefreshCw className={`size-2.5 ${retryingLogId === logItem.id ? 'animate-spin' : ''}`} />
                              재시도
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        )}

        <FieldError>{errorMessage}</FieldError>
        {noticeMessage ? <p className="text-sm font-medium text-foreground/80">{noticeMessage}</p> : null}
      </CardContent>

      {config?.isConnected ? (
        <CardFooter className="justify-end gap-3">
          <Button
            type="button"
            className="rounded-full px-5"
            disabled={isLoading || isSaving}
            onClick={handleSaveConfig}
          >
            {isSaving ? (
              <>
                <LoaderCircle className="size-4 animate-spin" />
                저장 중
              </>
            ) : (
              '설정 저장'
            )}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
