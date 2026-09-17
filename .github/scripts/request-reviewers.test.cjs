const test = require("node:test");
const assert = require("node:assert/strict");

const { run, selectReviewerLogins } = require("./request-reviewers.cjs");

test("PR 작성자와 봇을 제외한 모든 사용자 협업자를 리뷰어로 선택한다", () => {
  const collaborators = [
    { login: "author", type: "User" },
    { login: "reviewer-one", type: "User" },
    { login: "reviewer-two", type: "User" },
    { login: "dependabot[bot]", type: "Bot" },
    { login: "github-actions[bot]", type: "User" },
  ];

  assert.deepEqual(selectReviewerLogins(collaborators, "AUTHOR"), [
    "reviewer-one",
    "reviewer-two",
  ]);
});

test("Ready 상태가 되면 선택한 사용자에게 리뷰를 요청하고 작성자를 담당자로 지정한다", async () => {
  const requests = [];
  const assigneeRequests = [];
  const listCollaborators = Symbol("listCollaborators");
  const github = {
    paginate: async (endpoint, parameters) => {
      assert.equal(endpoint, listCollaborators);
      assert.deepEqual(parameters, {
        owner: "mokwon-atlex",
        repo: "atlex",
        affiliation: "all",
        per_page: 100,
      });
      return [
        { login: "author", type: "User" },
        { login: "reviewer-one", type: "User" },
        { login: "reviewer-two", type: "User" },
      ];
    },
    rest: {
      issues: {
        addAssignees: async (parameters) => assigneeRequests.push(parameters),
      },
      repos: { listCollaborators },
      pulls: {
        requestReviewers: async (parameters) => requests.push(parameters),
      },
    },
  };
  const context = {
    repo: { owner: "mokwon-atlex", repo: "atlex" },
    payload: {
      pull_request: { number: 25, user: { login: "author" } },
    },
  };

  await run({ github, context, core: { info() {} } });

  assert.deepEqual(requests, [
    {
      owner: "mokwon-atlex",
      repo: "atlex",
      pull_number: 25,
      reviewers: ["reviewer-one", "reviewer-two"],
    },
  ]);
  assert.deepEqual(assigneeRequests, [
    {
      owner: "mokwon-atlex",
      repo: "atlex",
      issue_number: 25,
      assignees: ["author"],
    },
  ]);
});

test("요청할 팀원이 없어도 작성자를 담당자로 지정한다", async () => {
  let requested = false;
  const assigneeRequests = [];
  const messages = [];
  const github = {
    paginate: async () => [{ login: "author", type: "User" }],
    rest: {
      issues: {
        addAssignees: async (parameters) => assigneeRequests.push(parameters),
      },
      repos: { listCollaborators() {} },
      pulls: {
        requestReviewers: async () => {
          requested = true;
        },
      },
    },
  };
  const context = {
    repo: { owner: "mokwon-atlex", repo: "atlex" },
    payload: {
      pull_request: { number: 25, user: { login: "author" } },
    },
  };

  await run({
    github,
    context,
    core: { info: (message) => messages.push(message) },
  });

  assert.equal(requested, false);
  assert.deepEqual(assigneeRequests, [
    {
      owner: "mokwon-atlex",
      repo: "atlex",
      issue_number: 25,
      assignees: ["author"],
    },
  ]);
  assert.deepEqual(messages, ["리뷰를 요청할 팀원이 없습니다."]);
});
