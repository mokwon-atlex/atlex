const RELATED_PRS_START = "<!-- related-prs:start -->";
const RELATED_PRS_END = "<!-- related-prs:end -->";
const RELATED_PRS_HEADING = "### 연관 PR";
const TITLE_TYPES = ["feat", "fix", "refactor", "test", "docs", "ci", "chore"];
const ISSUE_FIELD_IDS = {
  priority: 40009158,
  effort: 40009161,
};

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFormSelection(body, heading) {
  const pattern = new RegExp(
    `^#{2,3}\\s+${escapeRegExp(heading)}\\s*\\r?\\n\\s*\\r?\\n([^\\r\\n]+)`,
    "m",
  );
  const match = body.match(pattern);

  if (!match || match[1] === "_No response_") {
    return null;
  }

  return match[1].split(" — ")[0].trim() || null;
}

/**
 * 이슈 제목에서 팀 규칙에 맞는 작업 타입을 추출합니다.
 *
 * @param {string} title 이슈 제목
 * @returns {string|null} 작업 타입
 */
function extractTitleType(title) {
  const match = title.match(new RegExp(`^(${TITLE_TYPES.join("|")}):\\s+.+$`));
  return match?.[1] ?? null;
}

/**
 * 제목의 작업 타입을 GitHub 기본 이슈 타입으로 변환합니다.
 *
 * @param {string} titleType 제목 작업 타입
 * @returns {string} GitHub 이슈 타입
 */
function issueTypeForTitleType(titleType) {
  if (titleType === "feat") {
    return "Feature";
  }
  if (titleType === "fix") {
    return "Bug";
  }
  return "Task";
}

/**
 * 기존 비타입 라벨을 유지하면서 제목과 동일한 타입 라벨 하나만 남깁니다.
 *
 * @param {Array<string|object>} labels 기존 라벨
 * @param {string} titleType 제목 작업 타입
 * @returns {Array<string>} 동기화할 라벨 이름
 */
function synchronizeTypeLabels(labels, titleType) {
  const labelNames = labels.map((label) =>
    typeof label === "string" ? label : label.name,
  );
  return [
    ...labelNames.filter((label) => !TITLE_TYPES.includes(label)),
    titleType,
  ];
}

/**
 * 이슈 양식의 중요도와 작업 규모를 조직 이슈 필드 값으로 변환합니다.
 *
 * @param {string} issueBody 이슈 본문
 * @returns {Array<{field_id: number, value: string}>} 조직 이슈 필드 값
 */
function buildIssueFieldValues(issueBody) {
  const priority = { 높음: "High", 보통: "Medium", 낮음: "Low" }[
    extractFormSelection(issueBody, "중요도")
  ];
  const effort = { 큼: "High", 보통: "Medium", 작음: "Low" }[
    extractFormSelection(issueBody, "작업 규모")
  ];

  return [
    priority && { field_id: ISSUE_FIELD_IDS.priority, value: priority },
    effort && { field_id: ISSUE_FIELD_IDS.effort, value: effort },
  ].filter(Boolean);
}

/**
 * 이슈 제목, 라벨, 타입, 조직 이슈 필드를 팀 규칙에 맞게 동기화합니다.
 *
 * @param {object} github GitHub API 클라이언트
 * @param {string} owner 저장소 소유자
 * @param {string} repo 저장소 이름
 * @param {object} issue GitHub 이슈
 * @returns {Promise<void>}
 */
async function syncIssueMetadata(github, owner, repo, issue) {
  const titleType = extractTitleType(issue.title);
  if (!titleType) {
    throw new Error(
      `이슈 제목 형식이 올바르지 않습니다: ${TITLE_TYPES.map((type) => `${type}: 요약`).join(", ")}`,
    );
  }

  await github.request("PATCH /repos/{owner}/{repo}/issues/{issue_number}", {
    owner,
    repo,
    issue_number: issue.number,
    labels: synchronizeTypeLabels(issue.labels ?? [], titleType),
    type: issueTypeForTitleType(titleType),
    headers: { "X-GitHub-Api-Version": "2026-03-10" },
  });

  const issueFieldValues = buildIssueFieldValues(issue.body ?? "");
  if (issueFieldValues.length > 0) {
    await github.request(
      "POST /repos/{owner}/{repo}/issues/{issue_number}/issue-field-values",
      {
        owner,
        repo,
        issue_number: issue.number,
        issue_field_values: issueFieldValues,
        headers: { "X-GitHub-Api-Version": "2026-03-10" },
      },
    );
  }
}

function parseIssueReferences(body, repositoryOwner, repositoryName) {
  const references = new Map();
  const pattern = /\b(Closes|Related\s+to)\s+(?:([\w.-]+)\/([\w.-]+))?#(\d+)/gi;

  for (const match of body.matchAll(pattern)) {
    const [, keyword, owner, repository, issueNumberText] = match;
    if (
      owner &&
      (owner.toLowerCase() !== repositoryOwner.toLowerCase() ||
        repository.toLowerCase() !== repositoryName.toLowerCase())
    ) {
      continue;
    }

    const issueNumber = Number(issueNumberText);
    const relation = keyword.toLowerCase() === "closes" ? "closes" : "related";
    const existing = references.get(issueNumber);
    if (!existing || relation === "closes") {
      references.set(issueNumber, { issueNumber, relation });
    }
  }

  return [...references.values()].sort(
    (left, right) => left.issueNumber - right.issueNumber,
  );
}

function relatedPullRequestNumbers(body) {
  const managedSection = managedSectionMatch(body);
  if (!managedSection) {
    return [];
  }

  return [...managedSection[0].matchAll(/^- \[#(\d+)\]/gm)].map((match) =>
    Number(match[1]),
  );
}

function managedSectionMatch(body) {
  const pattern = new RegExp(
    `(?:\\r?\\n){0,2}${escapeRegExp(RELATED_PRS_HEADING)}\\r?\\n\\r?\\n${escapeRegExp(RELATED_PRS_START)}[\\s\\S]*?${escapeRegExp(RELATED_PRS_END)}`,
  );
  return body.match(pattern);
}

function pullRequestStatus(pullRequest) {
  if (pullRequest.merged) {
    return "병합됨";
  }
  return pullRequest.state === "closed" ? "병합 없이 닫힘" : "진행 중";
}

function escapeInlineCode(value) {
  return value.replace(/`/g, "'").replace(/\r?\n/g, " ").trim();
}

function renderRelatedPullRequests(body, pullRequests) {
  const withoutManagedSection = body
    .replace(managedSectionMatch(body)?.[0] ?? "", "")
    .trimEnd();
  if (pullRequests.length === 0) {
    return withoutManagedSection;
  }

  const lines = pullRequests
    .sort((left, right) => left.number - right.number)
    .map(
      (pullRequest) =>
        `- [#${pullRequest.number}](${pullRequest.url}) \`${escapeInlineCode(pullRequest.title)}\` — ${pullRequestStatus(pullRequest)}`,
    );
  const section = [
    RELATED_PRS_HEADING,
    "",
    RELATED_PRS_START,
    ...lines,
    RELATED_PRS_END,
  ].join("\n");

  return `${withoutManagedSection}\n\n${section}`.trim();
}

function selectStatus(currentStatus, issueState, pullRequests) {
  if (currentStatus === "보류") {
    return "보류";
  }
  if (issueState === "closed") {
    return "완료";
  }
  if (
    pullRequests.some(
      (pullRequest) => pullRequest.state === "open" || pullRequest.merged,
    )
  ) {
    return "진행 중";
  }
  return "시작 전";
}

/**
 * 프로젝트 필드 응답에서 단일 선택 필드만 이름으로 조회할 수 있게 변환합니다.
 *
 * @param {Array<object>} fields 프로젝트 필드 응답
 * @returns {Map<string, object>} 이름을 키로 사용하는 단일 선택 필드
 */
function buildSingleSelectFieldMap(fields) {
  return new Map(
    fields
      .filter((field) => Array.isArray(field?.options))
      .map((field) => [
        field.name,
        {
          ...field,
          options: new Map(
            field.options.map((option) => [option.name, option.id]),
          ),
        },
      ]),
  );
}

async function loadProject(github, owner, projectNumber) {
  const result = await github.graphql(
    `query($owner: String!, $projectNumber: Int!) {
      organization(login: $owner) {
        projectV2(number: $projectNumber) {
          id
          fields(first: 50) {
            nodes {
              ... on ProjectV2SingleSelectField {
                id
                name
                options { id name }
              }
            }
          }
        }
      }
    }`,
    { owner, projectNumber },
  );
  const project = result.organization?.projectV2;
  if (!project) {
    throw new Error(`Project를 찾을 수 없습니다: ${owner}#${projectNumber}`);
  }

  return {
    id: project.id,
    fields: buildSingleSelectFieldMap(project.fields.nodes),
  };
}

async function findProjectItem(github, contentId, projectId) {
  const result = await github.graphql(
    `query($contentId: ID!) {
      node(id: $contentId) {
        ... on Issue {
          projectItems(first: 50) {
            nodes {
              id
              project { id }
              fieldValues(first: 50) {
                nodes {
                  ... on ProjectV2ItemFieldSingleSelectValue {
                    name
                    field { ... on ProjectV2SingleSelectField { name } }
                  }
                }
              }
            }
          }
        }
      }
    }`,
    { contentId },
  );
  const item = result.node?.projectItems.nodes.find(
    (candidate) => candidate.project.id === projectId,
  );
  if (!item) {
    return null;
  }

  const statusValue = item.fieldValues.nodes.find(
    (value) => value?.field?.name === "Status",
  );
  return { id: item.id, status: statusValue?.name ?? null };
}

async function ensureProjectItem(github, contentId, projectId) {
  const existing = await findProjectItem(github, contentId, projectId);
  if (existing) {
    return existing;
  }

  const result = await github.graphql(
    `mutation($projectId: ID!, $contentId: ID!) {
      addProjectV2ItemById(input: {projectId: $projectId, contentId: $contentId}) {
        item { id }
      }
    }`,
    { projectId, contentId },
  );
  return { id: result.addProjectV2ItemById.item.id, status: null };
}

async function setSingleSelect(github, project, itemId, fieldName, optionName) {
  const field = project.fields.get(fieldName);
  const optionId = field?.options.get(optionName);
  if (!field || !optionId) {
    throw new Error(
      `Project 필드 값을 찾을 수 없습니다: ${fieldName}=${optionName}`,
    );
  }

  await github.graphql(
    `mutation($projectId: ID!, $itemId: ID!, $fieldId: ID!, $optionId: String!) {
      updateProjectV2ItemFieldValue(input: {
        projectId: $projectId,
        itemId: $itemId,
        fieldId: $fieldId,
        value: {singleSelectOptionId: $optionId}
      }) { projectV2Item { id } }
    }`,
    { projectId: project.id, itemId, fieldId: field.id, optionId },
  );
}

async function syncIssueFields(github, project, itemId, issueBody) {
  const mappings = [
    ["중요도", extractFormSelection(issueBody, "중요도")],
    ["작업 규모", extractFormSelection(issueBody, "작업 규모")],
  ];

  for (const [fieldName, optionName] of mappings) {
    if (optionName && project.fields.get(fieldName)?.options.has(optionName)) {
      await setSingleSelect(github, project, itemId, fieldName, optionName);
    }
  }
}

async function updateIssueStatus(
  github,
  project,
  issue,
  projectItem,
  pullRequests,
) {
  const status = selectStatus(projectItem.status, issue.state, pullRequests);
  if (status !== projectItem.status) {
    await setSingleSelect(github, project, projectItem.id, "Status", status);
  }
}

async function currentRelatedPullRequests(
  github,
  repositoryOwner,
  repositoryName,
  issueNumber,
  issueBody,
  currentPullRequestNumber,
) {
  const numbers = new Set(relatedPullRequestNumbers(issueBody));
  if (currentPullRequestNumber) {
    numbers.add(currentPullRequestNumber);
  }

  const related = [];
  for (const number of numbers) {
    let response;
    try {
      response = await github.rest.pulls.get({
        owner: repositoryOwner,
        repo: repositoryName,
        pull_number: number,
      });
    } catch (error) {
      if (error.status === 404) {
        continue;
      }
      throw error;
    }

    const pullRequest = response.data;
    const referencesIssue = parseIssueReferences(
      pullRequest.body ?? "",
      repositoryOwner,
      repositoryName,
    ).some((reference) => reference.issueNumber === issueNumber);
    if (!referencesIssue) {
      continue;
    }

    related.push({
      number: pullRequest.number,
      title: pullRequest.title,
      url: pullRequest.html_url,
      state: pullRequest.state,
      merged: Boolean(pullRequest.merged_at),
    });
  }

  return related;
}

async function synchronizeIssue(
  github,
  project,
  repositoryOwner,
  repositoryName,
  issueNumber,
  currentPullRequestNumber,
) {
  const response = await github.rest.issues.get({
    owner: repositoryOwner,
    repo: repositoryName,
    issue_number: issueNumber,
  });
  if (response.data.pull_request) {
    return;
  }

  const issue = response.data;
  await syncIssueMetadata(github, repositoryOwner, repositoryName, issue);
  const projectItem = await ensureProjectItem(
    github,
    issue.node_id,
    project.id,
  );
  await syncIssueFields(github, project, projectItem.id, issue.body ?? "");

  const pullRequests = await currentRelatedPullRequests(
    github,
    repositoryOwner,
    repositoryName,
    issueNumber,
    issue.body ?? "",
    currentPullRequestNumber,
  );
  const updatedBody = renderRelatedPullRequests(issue.body ?? "", pullRequests);
  if (updatedBody !== (issue.body ?? "")) {
    await github.rest.issues.update({
      owner: repositoryOwner,
      repo: repositoryName,
      issue_number: issueNumber,
      body: updatedBody,
    });
  }

  await updateIssueStatus(github, project, issue, projectItem, pullRequests);
}

async function run({ github, context, projectOwner, projectNumber }) {
  const repositoryOwner = context.repo.owner;
  const repositoryName = context.repo.repo;
  const project = await loadProject(github, projectOwner, projectNumber);

  if (context.eventName === "issues") {
    const issue = context.payload.issue;
    await syncIssueMetadata(github, repositoryOwner, repositoryName, issue);
    const projectItem = await ensureProjectItem(
      github,
      issue.node_id,
      project.id,
    );
    await syncIssueFields(github, project, projectItem.id, issue.body ?? "");

    if (["opened", "reopened", "closed"].includes(context.payload.action)) {
      const status = context.payload.action === "closed" ? "완료" : "시작 전";
      if (projectItem.status !== status) {
        await setSingleSelect(
          github,
          project,
          projectItem.id,
          "Status",
          status,
        );
      }
    }
    return;
  }

  if (context.eventName === "pull_request_target") {
    const currentBody = context.payload.pull_request.body ?? "";
    const previousBody = context.payload.changes?.body?.from ?? "";
    const references = [
      ...parseIssueReferences(currentBody, repositoryOwner, repositoryName),
      ...parseIssueReferences(previousBody, repositoryOwner, repositoryName),
    ];
    const issueNumbers = [
      ...new Set(references.map((reference) => reference.issueNumber)),
    ];

    for (const issueNumber of issueNumbers) {
      await synchronizeIssue(
        github,
        project,
        repositoryOwner,
        repositoryName,
        issueNumber,
        context.payload.pull_request.number,
      );
    }
  }
}

module.exports = {
  buildIssueFieldValues,
  buildSingleSelectFieldMap,
  extractFormSelection,
  extractTitleType,
  issueTypeForTitleType,
  parseIssueReferences,
  renderRelatedPullRequests,
  run,
  selectStatus,
  syncIssueMetadata,
  synchronizeTypeLabels,
};
