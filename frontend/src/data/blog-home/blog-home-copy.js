export const blogHomeFeedCopy = {
  eyebrowLabel: "Archive",
  defaultTitle: "\uC804\uCCB4 \uAE00",
  getEmptyStateTitle(title) {
    if (title) {
      return `"${title}" \uD0DC\uADF8\uC5D0 \uD574\uB2F9\uD558\uB294 \uAE00\uC774 \uC544\uC9C1 \uC5C6\uC2B5\uB2C8\uB2E4.`;
    }

    return "\uC544\uC9C1 \uC791\uC131\uD55C \uAE00\uC774 \uC5C6\uC2B5\uB2C8\uB2E4.";
  },
  emptyStateDescription:
    "\uB2E4\uB978 \uD0DC\uADF8\uB97C \uC120\uD0DD\uD558\uAC70\uB098 \uC804\uCCB4 \uAE00\uB85C \uB3CC\uC544\uAC00 \uBCF4\uC138\uC694.",
};
