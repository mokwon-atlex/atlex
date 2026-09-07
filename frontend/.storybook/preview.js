import { createElement } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "../src/app/globals.css";

/** @type { import('@storybook/nextjs-vite').Preview } */
const preview = {
  parameters: {
    nextjs: {
      appDirectory: true,
    },
    controls: {
      matchers: {
       color: /(background|color)$/i,
       date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo"
    }
  },
  decorators: [
    (Story) => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: { retry: false },
          mutations: { retry: false },
        },
      });

      return createElement(
        QueryClientProvider,
        { client: queryClient },
        createElement(Story),
      );
    },
  ],
};

export default preview;
