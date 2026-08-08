import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { MemoryRouter } from "react-router-dom";

import ImageCompress from "../pages/ImageCompress";
import { HistoryProvider } from "../context/HistoryContext";

vi.mock("../utils/toast", () => ({
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  toastInfo: vi.fn(),
  toastLoading: vi.fn(() => "toast-id"),
  toastDismiss: vi.fn(),
  parseApiError: vi.fn(async () => "Request failed"),
}));

const fetchMock = vi.fn();

const renderPage = () =>
  render(
    <MemoryRouter>
      <HistoryProvider>
        <ImageCompress />
      </HistoryProvider>
    </MemoryRouter>
  );

// The upload area is lazy loaded, so the file input only exists once the
// Suspense boundary has resolved.
const selectImage = async () => {
  await waitFor(() =>
    expect(document.querySelector('input[type="file"]')).toBeInTheDocument()
  );

  const input = document.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["fake-image-bytes"], "photo.png", {
    type: "image/png",
  });

  fireEvent.change(input, { target: { files: [file] } });

  return await screen.findByRole("button", { name: "WebP" });
};

const submittedFormData = () => fetchMock.mock.calls[0][1].body as FormData;

describe("Image compress output format", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    (globalThis.URL.createObjectURL as any) = vi.fn(() => "blob:compressed");
    (globalThis.URL.revokeObjectURL as any) = vi.fn();

    fetchMock.mockResolvedValue({
      ok: true,
      blob: async () => new Blob(["compressed"]),
    });
    globalThis.fetch = fetchMock as any;
  });

  it("offers every supported output format and defaults to Original", async () => {
    renderPage();
    await selectImage();

    for (const label of ["Original", "JPEG", "WebP", "PNG"]) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }

    expect(screen.getByRole("button", { name: "Original" })).toHaveAttribute(
      "aria-pressed",
      "true"
    );
  });

  it("sends the selected format alongside the quality value", async () => {
    renderPage();
    const webpButton = await selectImage();

    fireEvent.click(webpButton);
    expect(webpButton).toHaveAttribute("aria-pressed", "true");

    fireEvent.click(screen.getByRole("button", { name: /compress image/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    const formData = submittedFormData();
    expect(formData.get("format")).toBe("webp");
    expect(formData.get("quality")).toBe("70");
  });

  it("defaults to the original format when nothing is picked", async () => {
    renderPage();
    await selectImage();

    fireEvent.click(screen.getByRole("button", { name: /compress image/i }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(submittedFormData().get("format")).toBe("original");
  });

  it("explains that the quality slider does not apply to PNG", async () => {
    renderPage();
    await selectImage();

    expect(screen.queryByText(/lossless format/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "PNG" }));

    expect(await screen.findByText(/lossless format/i)).toBeInTheDocument();
  });
});
