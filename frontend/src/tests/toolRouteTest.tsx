import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import App from "../App";
import { HistoryProvider } from "../context/HistoryContext";
import { ThemeProvider } from "../context/ThemeContext";

export const expectToolRouteToRender = async (path: string) => {
  render(
    <ThemeProvider>
      <MemoryRouter initialEntries={[path]}>
        <HistoryProvider>
          <App />
        </HistoryProvider>
      </MemoryRouter>
    </ThemeProvider>,
  );

  await waitFor(() => {
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).not.toHaveTextContent("Loading");
  });

  expect(screen.queryByText("Something went wrong")).not.toBeInTheDocument();
};