const test = require("node:test");
const assert = require("node:assert/strict");

const {
  buildIssueFieldValues,
  buildSingleSelectFieldMap,
  extractFormSelection,
  extractTitleType,
  issueTypeForTitleType,
  parseIssueReferences,
  renderRelatedPullRequests,
  selectStatus,
  syncIssueMetadata,
  synchronizeTypeLabels,
} = require("./project-automation.cjs");

test("프로젝트 필드 응답에서 단일 선택 필드만 변환한다", () => {
  const fields = buildSingleSelectFieldMap([
    {},
    {
      id: "status-field-id",
      name: "Status",
      options: [
        { id: "todo-option-id", name: "시작 전" },
        { id: "done-option-id", name: "완료" },
      ],
    },
  ]);

  assert.deepEqual(fields.get("Status"), {
    id: "status-field-id",
    name: "Status",
    options: new Map([
      ["시작 전", "todo-option-id"],
      ["완료", "done-option-id"],
    ]),
  });
  assert.equal(fields.size, 1);
});

test("이슈 양식의 선택값에서 설명을 제외한 값만 읽는다", () => {
  const body = [
    "## 중요도",
    "",
    "높음 — 핵심 기능 또는 후속 작업에 직접 영향",
    "",
    "### 작업 규모",
    "",
    "큼 — 영향을 주는 요소가 많은 작업 (이슈 분할 가능한지 검토)",
  ].join("\n");

  assert.equal(extractFormSelection(body, "중요도"), "높음");
  assert.equal(extractFormSelection(body, "작업 규모"), "큼");
});

test("제목 다음에 빈 줄이 없는 수동 이슈의 선택값도 읽는다", () => {
  const body = ["### 중요도", "보통 — 일반적인 기능 개발 및 개선"].join("\n");

  assert.equal(extractFormSelection(body, "중요도"), "보통");
});

test("이슈 제목에서 허용된 작업 타입만 읽는다", () => {
  assert.equal(extractTitleType("feat: 소셜 로그인 구현"), "feat");
  assert.equal(extractTitleType("hotfix: 로그인 복구"), null);
  assert.equal(extractTitleType("[feat] 소셜 로그인 구현"), null);
});

test("제목 타입을 GitHub 이슈 타입으로 변환한다", () => {
  assert.equal(issueTypeForTitleType("feat"), "Feature");
  assert.equal(issueTypeForTitleType("fix"), "Bug");
  assert.equal(issueTypeForTitleType("refactor"), "Task");
  assert.equal(issueTypeForTitleType("docs"), "Task");
});

test("기존 타입 라벨을 제목 타입 라벨 하나로 동기화한다", () => {
  assert.deepEqual(synchronizeTypeLabels(["backend", "fix", "문서"], "feat"), [
    "backend",
    "문서",
    "feat",
  ]);
});

test("이슈 양식 값을 조직 이슈 필드 값으로 변환한다", () => {
  const body = [
    "### 중요도",
    "",
    "높음 — 핵심 기능 또는 후속 작업에 직접 영향",
    "",
    "## 작업 규모",
    "",
    "보통 — 일반적인 범위의 작업",
  ].join("\n");

  assert.deepEqual(buildIssueFieldValues(body), [
    { field_id: 40009158, value: "High" },
    { field_id: 40009161, value: "Medium" },
  ]);
});

test("이슈 메타데이터를 제목과 양식에 맞게 GitHub에 반영한다", async () => {
  const requests = [];
  const github = {
    request: async (route, parameters) => requests.push({ route, parameters }),
  };

  await syncIssueMetadata(github, "mokwon-atlex", "atlex", {
    number: 6,
    title: "fix: Tiptap 확장 중복 등록 제거",
    labels: [{ name: "feat" }, { name: "frontend" }],
    body: ["### 중요도", "", "보통", "", "### 작업 규모", "", "작음"].join(
      "\n",
    ),
  });

  assert.deepEqual(requests, [
    {
      route: "PATCH /repos/{owner}/{repo}/issues/{issue_number}",
      parameters: {
        owner: "mokwon-atlex",
        repo: "atlex",
        issue_number: 6,
        labels: ["frontend", "fix"],
        type: "Bug",
        headers: { "X-GitHub-Api-Version": "2026-03-10" },
      },
    },
    {
      route:
        "POST /repos/{owner}/{repo}/issues/{issue_number}/issue-field-values",
      parameters: {
        owner: "mokwon-atlex",
        repo: "atlex",
        issue_number: 6,
        issue_field_values: [
          { field_id: 40009158, value: "Medium" },
          { field_id: 40009161, value: "Low" },
        ],
        headers: { "X-GitHub-Api-Version": "2026-03-10" },
      },
    },
  ]);
});

test("Closes와 Related to 참조를 구분하고 중복에서는 Closes를 우선한다", () => {
  const references = parseIssueReferences(
    [
      "Closes #12",
      "Related to #34",
      "related TO mokwon-atlex/atlex#56",
      "Related to #12",
    ].join("\n"),
    "mokwon-atlex",
    "atlex",
  );

  assert.deepEqual(references, [
    { issueNumber: 12, relation: "closes" },
    { issueNumber: 34, relation: "related" },
    { issueNumber: 56, relation: "related" },
  ]);
});

test("연관 PR 영역만 교체하고 사용자가 작성한 본문은 유지한다", () => {
  const original = [
    "### 참고 사항",
    "",
    "사용자가 작성한 내용",
    "",
    "### 연관 PR",
    "",
    "<!-- related-prs:start -->",
    "- #1 [이전 PR](https://example.com/1) — 진행 중",
    "<!-- related-prs:end -->",
  ].join("\n");

  const updated = renderRelatedPullRequests(original, [
    {
      number: 25,
      title: "feat: 소셜 로그인 기능 구현",
      url: "https://github.com/mokwon-atlex/atlex/pull/25",
      state: "open",
      merged: false,
    },
    {
      number: 28,
      title: "test: 소셜 로그인 테스트 추가",
      url: "https://github.com/mokwon-atlex/atlex/pull/28",
      state: "closed",
      merged: true,
    },
  ]);

  assert.match(updated, /사용자가 작성한 내용/);
  assert.doesNotMatch(updated, /이전 PR/);
  assert.match(updated, /\[#25\].+`feat: 소셜 로그인 기능 구현` — 진행 중/);
  assert.match(updated, /\[#28\].+`test: 소셜 로그인 테스트 추가` — 병합됨/);
});

test("연관 PR이 없으면 자동 관리 영역을 제거한다", () => {
  const body = [
    "본문",
    "",
    "### 연관 PR",
    "",
    "<!-- related-prs:start -->",
    "- #1 [PR](https://example.com/1) — 진행 중",
    "<!-- related-prs:end -->",
  ].join("\n");

  assert.equal(renderRelatedPullRequests(body, []), "본문");
});

test("보류 상태는 PR 상태보다 우선한다", () => {
  assert.equal(
    selectStatus("보류", "open", [{ state: "open", merged: false }]),
    "보류",
  );
});

test("닫힌 이슈는 완료로 변경한다", () => {
  assert.equal(selectStatus("진행 중", "closed", []), "완료");
});

test("진행 중이거나 병합된 PR이 있으면 진행 중을 유지한다", () => {
  assert.equal(
    selectStatus("시작 전", "open", [{ state: "open", merged: false }]),
    "진행 중",
  );
  assert.equal(
    selectStatus("시작 전", "open", [{ state: "closed", merged: true }]),
    "진행 중",
  );
});

test("모든 PR이 병합 없이 닫히면 시작 전으로 돌아간다", () => {
  assert.equal(
    selectStatus("진행 중", "open", [{ state: "closed", merged: false }]),
    "시작 전",
  );
});
