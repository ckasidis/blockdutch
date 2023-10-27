export function getBasePath(path: string) {
  const parts = path.split("/");
  return parts.length > 1 ? `/${parts[1]}` : path;
}
