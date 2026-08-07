export function getPdfFiles(incoming: FileList | File[]) {
  return Array.from(incoming as ArrayLike<File>).filter(
    (file) =>
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
  );
}
