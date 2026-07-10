import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useFileUpload } from "../useFileUpload";

vi.mock("../../utils/toast", () => ({
  toastError: vi.fn(),
  toastInfo: vi.fn(),
}));

describe("useFileUpload", () => {
  const validateFile = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    (globalThis.URL.createObjectURL as any) = vi.fn(
      () => "blob:test-preview"
    );

    (globalThis.URL.revokeObjectURL as any) = vi.fn();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() =>
      useFileUpload(validateFile)
    );

    expect(result.current.file).toBeNull();
    expect(result.current.files).toEqual([]);
    expect(result.current.previewUrl).toBeNull();
    expect(result.current.isDragging).toBe(false);
  });

  it("accepts a valid file", async () => {
    validateFile.mockResolvedValue({
      isValid: true,
      message: "Valid file",
    });

    const file = new File(["hello"], "test.png", {
      type: "image/png",
    });

    const { result } = renderHook(() =>
      useFileUpload(validateFile)
    );

    await act(async () => {
      await result.current.processFile(file);
    });

    expect(result.current.file).toEqual(file);
    expect(result.current.files).toHaveLength(1);
  });

  it("rejects files larger than maxSize", async () => {
    const file = new File(
      [new ArrayBuffer(20)],
      "large.pdf",
      { type: "application/pdf" }
    );

    Object.defineProperty(file, "size", {
      value: 20,
    });

    const { result } = renderHook(() =>
      useFileUpload(validateFile, {
        maxSize: 10,
      })
    );

    await act(async () => {
      await result.current.processFile(file);
    });

    expect(result.current.file).toBeNull();
  });

  it("creates preview URL for image files", async () => {
    validateFile.mockResolvedValue({
      isValid: true,
      message: "Valid image",
    });

    const file = new File(["img"], "image.png", {
      type: "image/png",
    });

    const { result } = renderHook(() =>
      useFileUpload(validateFile)
    );

    await act(async () => {
      await result.current.processFile(file);
    });

    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(result.current.previewUrl).toBe("blob:test-preview");
  });

  it("clears selected files", async () => {
    validateFile.mockResolvedValue({
      isValid: true,
      message: "Valid image",
    });

    const file = new File(["img"], "image.png", {
      type: "image/png",
    });

    const { result } = renderHook(() =>
      useFileUpload(validateFile)
    );

    await act(async () => {
      await result.current.processFile(file);
    });

    act(() => {
      result.current.handleClear();
    });

    expect(result.current.file).toBeNull();
    expect(result.current.files).toEqual([]);
  });

  // Validation Failure
  it("rejects invalid files", async () => {
    validateFile.mockResolvedValue({
      isValid: false,
      message: "Invalid file",
    });

    const file = new File(["bad"], "bad.txt", {
      type: "text/plain",
    });

    const { result } = renderHook(() =>
      useFileUpload(validateFile)
    );

    await act(async () => {
      await result.current.processFile(file);
    });

    expect(result.current.file).toBeNull();
  });

  // Multiple File Upload Mode
  it("supports multiple file uploads", async () => {
    validateFile.mockResolvedValue({
      isValid: true,
      message: "Valid file",
    });

    const file1 = new File(["1"], "one.png", {
      type: "image/png",
    });

    const file2 = new File(["2"], "two.png", {
      type: "image/png",
    });

    const { result } = renderHook(() =>
      useFileUpload(validateFile, {
        multiple: true,
        maxFiles: 5,
      })
    );

    await act(async () => {
      await result.current.processFiles([file1, file2]);
    });

    expect(result.current.files).toHaveLength(2);
  });
});