/**
 * 저장소 협업자 중 PR 리뷰어로 지정할 사용자 이름을 선택합니다.
 *
 * @param {Array<{login: string, type: string}>} collaborators 저장소 협업자 목록
 * @param {string} authorLogin PR 작성자 사용자 이름
 * @returns {string[]} 리뷰어 사용자 이름 목록
 */
function selectReviewerLogins(collaborators, authorLogin) {
  const normalizedAuthor = authorLogin.toLowerCase();

  return collaborators
    .filter(
      ({ login, type }) =>
        type === "User" &&
        login.toLowerCase() !== normalizedAuthor &&
        !login.toLowerCase().endsWith("[bot]"),
    )
    .map(({ login }) => login);
}

/**
 * Ready for review 상태의 PR 작성자를 담당자로 지정하고 저장소 팀원 전체에게 리뷰를 요청합니다.
 *
 * @param {object} parameters 실행 매개변수
 * @param {object} parameters.github GitHub API 클라이언트
 * @param {object} parameters.context GitHub Actions 실행 컨텍스트
 * @param {object} parameters.core GitHub Actions 로그 도구
 * @returns {Promise<void>}
 */
async function run({ github, context, core }) {
  const { owner, repo } = context.repo;
  const pullRequest = context.payload.pull_request;
  const collaborators = await github.paginate(
    github.rest.repos.listCollaborators,
    {
      owner,
      repo,
      affiliation: "all",
      per_page: 100,
    },
  );
  const reviewers = selectReviewerLogins(collaborators, pullRequest.user.login);

  await github.rest.issues.addAssignees({
    owner,
    repo,
    issue_number: pullRequest.number,
    assignees: [pullRequest.user.login],
  });

  if (reviewers.length === 0) {
    core.info("리뷰를 요청할 팀원이 없습니다.");
    return;
  }

  await github.rest.pulls.requestReviewers({
    owner,
    repo,
    pull_number: pullRequest.number,
    reviewers,
  });
}

module.exports = { run, selectReviewerLogins };
