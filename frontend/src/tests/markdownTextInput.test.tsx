import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { MemoryRouter } from "react-router-dom";

import MdToHtml from "../pages/MdToHtml";
import MdToDocx from "../pages/MdToDocx";
import { HistoryProvider } from "../context/HistoryContext";

const renderPage = (ui) =>
  render(
    <MemoryRouter>
      <HistoryProvider>{ui}</HistoryProvider>
    </MemoryRouter>
  );

const clickMode = (name) =>
  fireEvent.click(screen.getByRole("button", { name }));

describe.each([
  { name: "Markdown to HTML", Page: MdToHtml, submitLabel: /convert to html/i },
  { name: "Markdown to DOCX", Page: MdToDocx, submitLabel: /convert to docx/i },
])("$name text input", ({ Page, submitLabel }) => {
  it("starts in file mode with no Markdown textarea", async () => {
    renderPage(<Page />);

    expect(
      await screen.findByRole("button", { name: /upload \.md file/i })
    ).toBeInTheDocument();
    expect(screen.queryByLabelText(/markdown text/i)).not.toBeInTheDocument();
  });

  it("swaps the file upload area for a textarea in text mode", async () => {
    renderPage(<Page />);
    await screen.findByRole("button", { name: /paste markdown/i });

    clickMode(/paste markdown/i);

    expect(await screen.findByLabelText(/markdown text/i)).toBeInTheDocument();
    await waitFor(() =>
      expect(document.querySelector('input[type="file"]')).not.toBeInTheDocument()
    );
  });

  it("keeps submit disabled until Markdown text is entered", async () => {
    renderPage(<Page />);
    await screen.findByRole("button", { name: /paste markdown/i });

    clickMode(/paste markdown/i);

    const submit = screen.getByRole("button", { name: submitLabel });
    expect(submit).toBeDisabled();

    fireEvent.change(await screen.findByLabelText(/markdown text/i), {
      target: { value: "# Heading" },
    });
    expect(submit).toBeEnabled();
  });

  it("discards typed Markdown when switching back to file mode", async () => {
    renderPage(<Page />);
    await screen.findByRole("button", { name: /paste markdown/i });

    clickMode(/paste markdown/i);
    fireEvent.change(await screen.findByLabelText(/markdown text/i), {
      target: { value: "# Heading" },
    });

    clickMode(/upload \.md file/i);
    clickMode(/paste markdown/i);

    expect(await screen.findByLabelText(/markdown text/i)).toHaveValue("");
  });
});
