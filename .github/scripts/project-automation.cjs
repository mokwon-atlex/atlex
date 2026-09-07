const RELATED_PRS_START = "<!-- related-prs:start -->";
const RELATED_PRS_END = "<!-- related-prs:end -->";
const RELATED_PRS_HEADING = "### 연관 PR";

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function extractFormSelection(body, heading) {
  const pattern = new RegExp(
    `^###\\s+${escapeRegExp(heading)}\\s*\\r?\\n\\s*\\r?\\n([^\\r\\n]+)`,
    "m",
  );
  const match = body.match(pattern);

  if (!match || match[1] === "_No response_") {
    return null;
  }

  return match[1].split(" — ")[0].trim() || null;
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

  return [...references.values()].sort((left, right) => left.issueNumber - right.issueNumber);
}

function relatedPullRequestNumbers(body) {
  const managedSection = managedSectionMatch(body);
  if (!managedSection) {
    return [];
  }

  return [...managedSection[0].matchAll(/^- \[#(\d+)\]/gm)].map((match) => Number(match[1]));
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
  const withoutManagedSection = body.replace(managedSectionMatch(body)?.[0] ?? "", "").trimEnd();
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
  if (pullRequests.some((pullRequest) => pullRequest.state === "open" || pullRequest.merged)) {
    return "진행 중";
  }
  return "시작 전";
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
    fields: new Map(
      project.fields.nodes
        .filter(Boolean)
        .map((field) => [field.name, { ...field, options: new Map(field.options.map((option) => [option.name, option.id])) }]),
    ),
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
  const item = result.node?.projectItems.nodes.find((candidate) => candidate.project.id === projectId);
  if (!item) {
    return null;
  }

  const statusValue = item.fieldValues.nodes.find((value) => value?.field?.name === "Status");
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
    throw new Error(`Project 필드 값을 찾을 수 없습니다: ${fieldName}=${optionName}`);
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

async function updateIssueStatus(github, project, issue, projectItem, pullRequests) {
  const status = selectStatus(projectItem.status, issue.state, pullRequests);
  if (status !== projectItem.status) {
    await setSingleSelect(github, project, projectItem.id, "Status", status);
  }
}

async function currentRelatedPullRequests(github, repositoryOwner, repositoryName, issueNumber, issueBody, currentPullRequestNumber) {
  const numbers = new Set(relatedPullRequestNumbers(issueBody));
  if (currentPullRequestNumber) {
    numbers.add(currentPullRequestNumber);
  }

  const related = [];
  for (const number of numbers) {
    let response;
    try {
      response = await github.rest.pulls.get({ owner: repositoryOwner, repo: repositoryName, pull_number: number });
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

async function synchronizeIssue(github, project, repositoryOwner, repositoryName, issueNumber, currentPullRequestNumber) {
  const response = await github.rest.issues.get({ owner: repositoryOwner, repo: repositoryName, issue_number: issueNumber });
  if (response.data.pull_request) {
    return;
  }

  const issue = response.data;
  const projectItem = await ensureProjectItem(github, issue.node_id, project.id);
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
    const projectItem = await ensureProjectItem(github, issue.node_id, project.id);
    await syncIssueFields(github, project, projectItem.id, issue.body ?? "");

    if (["opened", "reopened", "closed"].includes(context.payload.action)) {
      const status = context.payload.action === "closed" ? "완료" : "시작 전";
      if (projectItem.status !== status) {
        await setSingleSelect(github, project, projectItem.id, "Status", status);
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
    const issueNumbers = [...new Set(references.map((reference) => reference.issueNumber))];

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
  extractFormSelection,
  parseIssueReferences,
  renderRelatedPullRequests,
  run,
  selectStatus,
};
