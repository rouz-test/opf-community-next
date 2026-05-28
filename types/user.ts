export type UserAccountStatus = 'active' | 'suspended' | 'withdrawn';

export type UserSocialProvider = 'google' | 'kakao';

export type CommunityDefaultIdentity = 'real' | 'anonymous';

export type UserProductStatus = 'draft' | 'published' | 'archived';

export type CampusMemberStatus = 'none' | 'applicant' | 'participant' | 'alumni';

export type UserAccount = {
  accountId: string;
  status: UserAccountStatus;
  auth: {
    provider: UserSocialProvider;
    socialEmail: string;
  };
  verification: {
    realName: string;
    phoneNumber: string;
    verifiedAt: string;
  };
  contact: {
    additionalEmail: string | null;
  };
  profile: {
    avatar: string;
    company: string;
    position: string;
  };
  createdAt: string;
  updatedAt: string;
};

export type UserProduct = {
  productId: string;
  ownerAccountId: string;
  status: UserProductStatus;
  name: string;
  summary: string;
  industry: string;
  category: string;
  link: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserCommunityProfile = {
  accountId: string;
  defaultIdentity: CommunityDefaultIdentity;
  isVerified: boolean;
  moderation?: {
    isSuspended: boolean;
    suspendedAt: string | null;
    suspendedByAdminId: string | null;
    suspensionReason: string | null;
  };
  stats: {
    postCount: number;
    commentCount: number;
    followerCount: number;
    followingCount: number;
  };
  settings: {
    allowFollowerNotification: boolean;
    allowCommentNotification: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type UserCampusProfile = {
  accountId: string;
  status: CampusMemberStatus;
  applicationIds: string[];
  teamIds: string[];
  settings: {
    allowCampusNotification: boolean;
  };
  createdAt: string;
  updatedAt: string;
};

export type UserAdminNote = {
  noteId: string;
  accountId: string;
  body: string;
  createdByAdminId: string;
  createdAt: string;
  updatedAt: string;
};

export type UserProfileBundle = {
  account: UserAccount;
  products: UserProduct[];
  primaryProduct: UserProduct | null;
  communityProfile: UserCommunityProfile | null;
  campusProfile: UserCampusProfile | null;
  adminNotes?: UserAdminNote[];
};
