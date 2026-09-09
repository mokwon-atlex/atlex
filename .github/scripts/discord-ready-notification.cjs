/**
 * Ready for review 전환 내용을 Discord에 알립니다.
 *
 * @param {object} parameters 실행 매개변수
 * @param {string} parameters.webhookUrl Discord 웹훅 URL
 * @param {object} parameters.pullRequest GitHub PR 정보
 * @param {Function} parameters.fetchImpl HTTP 요청 함수
 * @param {object} parameters.core GitHub Actions 로그 도구
 * @returns {Promise<boolean>} 알림 전송 여부
 */
async function sendReadyNotification({
  webhookUrl,
  pullRequest,
  fetchImpl,
  core,
}) {
  if (!webhookUrl) {
    core.warning(
      "DISCORD_WEBHOOK_URL Secret이 없어 Discord 알림을 건너뜁니다.",
    );
    return false;
  }

  const content = [
    "**리뷰 요청**",
    `[#${pullRequest.number} ${pullRequest.title}](${pullRequest.html_url})`,
    `작성자: ${pullRequest.user.login}`,
  ].join("\n");

  const response = await fetchImpl(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content,
      allowed_mentions: { parse: [] },
    }),
  });

  if (!response.ok) {
    throw new Error(`Discord 알림 전송 실패: HTTP ${response.status}`);
  }

  return true;
}

module.exports = { sendReadyNotification };
