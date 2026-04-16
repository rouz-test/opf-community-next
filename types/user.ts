export interface UserProfile {
    name: string;
    email: string;
  }
  
  export interface User {
    id: string;
    profile: UserProfile;
  }