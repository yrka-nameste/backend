export type JwtUser = {
  userId: string;
  role: 'ADMIN' | 'PARENT' | 'TEACHER';
  email: string | null;
  branchId: string | null;
};

