import { createBrowserRouter } from "react-router";
import { Layout } from "@/app/components/Layout";
import { StudyListPage } from "@/app/pages/StudyListPage";
import { StudyDetailPage } from "@/app/pages/StudyDetailPage";
import { MyStudyPage } from "@/app/pages/MyStudyPage";
import { CampusPage } from "@/app/pages/CampusPage";
import { SettingsPage } from "@/app/pages/SettingsPage";
import { CommunityHomePage } from "@/app/pages/CommunityHomePage";
import { CommunityWritePage } from "@/app/pages/CommunityWritePage";
import { CommunityPostDetailPage } from "@/app/pages/CommunityPostDetailPage";
import { CommunityStudyBoardPage } from "@/app/pages/CommunityStudyBoardPage";
import { CommunityCategoryBoardPage } from "@/app/pages/CommunityCategoryBoardPage";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { 
        index: true, 
        Component: StudyListPage 
      },
      { 
        path: "study/:id", 
        Component: StudyDetailPage 
      },
      { 
        path: "my-study", 
        Component: MyStudyPage 
      },
      { 
        path: "campus", 
        Component: CampusPage 
      },
      { 
        path: "settings", 
        Component: SettingsPage 
      },
      {
        path: "community",
        Component: CommunityHomePage
      },
      {
        path: "community/write",
        Component: CommunityWritePage
      },
      {
        path: "community/post/:id",
        Component: CommunityPostDetailPage
      },
      {
        path: "community/study",
        Component: CommunityStudyBoardPage
      },
      {
        path: "community/category/:categoryId",
        Component: CommunityCategoryBoardPage
      },
    ],
  },
]);