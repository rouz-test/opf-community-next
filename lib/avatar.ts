export function getCompactAvatar(avatar: string | null | undefined, fallbackAvatar: string) {
  const trimmedAvatar = avatar?.trim();

  if (!trimmedAvatar) return fallbackAvatar;

  return trimmedAvatar.startsWith('data:image/') ? fallbackAvatar : trimmedAvatar;
}
