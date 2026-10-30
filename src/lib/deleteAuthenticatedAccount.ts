interface DeletionSession {
  access_token: string;
  user: { id: string; identities?: { provider: string; identity_data?: { sub?: string } }[] };
}

let deleting = false;
export const isDeletingRemoteAccount = () => deleting;

export async function deleteAuthenticatedAccount(expectedUserId: string, dependencies: {
  getSession: () => Promise<DeletionSession | null>;
  authorizeApple: (subject: string) => Promise<string>;
  removeAccount: (token: string, authorizationCode?: string) => Promise<void>;
}): Promise<void> {
  if (deleting) throw new Error('Penghapusan akun sedang berlangsung.');
  deleting = true;
  try {
    const session = await dependencies.getSession();
    if (!session?.access_token || !expectedUserId || session.user.id !== expectedUserId) {
      throw new Error('Sesi akun tidak cocok. Silakan masuk kembali sebelum menghapus akun.');
    }
    const apple = session.user.identities?.find(identity => identity.provider === 'apple');
    let code: string | undefined;
    if (apple) {
      const subject = apple.identity_data?.sub;
      if (!subject) throw new Error('Identitas Apple belum tersedia. Silakan masuk kembali.');
      code = await dependencies.authorizeApple(subject);
      if (!code) throw new Error('Apple belum memberikan kode verifikasi. Akun belum dihapus.');
    }
    const current = await dependencies.getSession();
    if (!current?.access_token || current.user.id !== expectedUserId) {
      throw new Error('Sesi akun berubah. Penghapusan dibatalkan; silakan coba lagi.');
    }
    await dependencies.removeAccount(current.access_token, code);
  } finally {
    deleting = false;
  }
}
