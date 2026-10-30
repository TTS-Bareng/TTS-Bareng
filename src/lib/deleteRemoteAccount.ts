export async function deleteRemoteAccount(
  isGuest: boolean,
  getUserId: () => Promise<string | null>,
  deleteAccount: () => Promise<void>,
  expectedUserId?: string,
): Promise<void> {
  if (isGuest) return;
  const userId = await getUserId();
  if (!userId || !expectedUserId || userId !== expectedUserId) {
    throw new Error('Sesi akun tidak tersedia atau tidak cocok. Silakan masuk kembali dan coba lagi.');
  }
  await deleteAccount();
}
