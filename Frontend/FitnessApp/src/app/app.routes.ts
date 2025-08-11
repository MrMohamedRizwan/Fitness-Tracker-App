import { Routes } from '@angular/router';
import { LoginComponet } from './component/login-componet/login-componet';
import { ClientDashboard } from './component/client/client-dashboard/client-dashboard';
import { AuthGuard } from './guards/auth-guard';
import { Unauthorized } from './component/unauthorized/unauthorized';
import { SignupComponent } from './component/signup-component/signup-component';

import { CoachDashboard } from './component/coach/coach-dashboard/coach-dashboard';
import { ClientDetails } from './component/client/client-details/client-details';
import { CoachLayout } from './component/layout/coach-layout/coach-layout';
import { MyClient } from './component/coach/my-client/my-client';
import { AssignPlan } from './component/coach/assign-plan/assign-plan';
import { CreatePlan } from './component/coach/create-plan/create-plan';
import { Notification } from './component/notification/notification';
import { ClientProgress } from './component/coach/client-progress/client-progress';
import { WorkoutDetails } from './component/coach/workout-details/workout-details';
import { DietDetails } from './component/coach/diet-details/diet-details';
import { ViewPlan } from './component/coach/view-workout-plan/view-plan';
import { ViewDietPlan } from './component/coach/view-diet-plan/view-diet-plan';
import { ClientLayout } from './component/layout/client-layout/client-layout';
import { MyPlans } from './component/client/my-plans/my-plans';
import { DietPlan } from './component/client/diet-plan/diet-plan';
import { WorkoutPlan } from './component/client/workout-plan/workout-plan';
import { Progress } from './component/client/progress/progress';
import { Stats } from './component/client/stats/stats';
import { Viewprogress } from './component/coach/viewprogress/viewprogress';
import { AdminDashboard } from './component/admin/admin-dashboard/admin-dashboard';
import { Toasssss } from './toasssss/toasssss';
import { ChatComponent } from './chat-component/chat-component';
import { ChatCoach } from './component/coah/chat-coach/chat-coach';
import { Adminlayout } from './component/admin/adminlayout/adminlayout';
import { AdminDashboardClient } from './component/admin/admin-dashboard-client/admin-dashboard-client';
import { CoachList } from './component/coach/coach-list/coach-list';

export const routes: Routes = [
  { path: 'notification', component: Notification },
  { path: 'ts', component: Toasssss },

  { path: '', component: LoginComponet },
  { path: 'signup', component: SignupComponent },
  {
    path: 'update-details',
    component: ClientDetails,
    canActivate: [AuthGuard],
    data: { roles: ['Client'] },
  },
  {
    path: '',
    component: CoachLayout,
    canActivate: [AuthGuard],
    data: { roles: ['Coach'] },
    children: [
      { path: 'coach-dashboard', component: CoachDashboard },
      { path: 'clients-list', component: MyClient },
      { path: 'assign-plan', component: AssignPlan },
      { path: 'assign-plan/:clientId', component: AssignPlan },
      { path: 'create-plan', component: CreatePlan },
      { path: 'view-workout-plan', component: ViewPlan },
      { path: 'view-diet-plan', component: ViewDietPlan },
      { path: 'chatCoach', component: ChatCoach },

      { path: 'client-details/:clientId', component: ClientProgress },
      { path: 'workout-details/:workoutId', component: WorkoutDetails },
      { path: 'diet-details/:dietId', component: DietDetails },
      { path: 'clientProgress/:clientId', component: Viewprogress },
      { path: 'delegate/:clientId', component: CoachList },
    ],
  },
  {
    path: '',
    component: ClientLayout,
    canActivate: [AuthGuard],
    data: { roles: ['Client'] },
    children: [
      { path: 'client-dashboard', component: ClientDashboard },
      { path: 'myPlans', component: MyPlans },
      {
        path: 'client-diet-plan/:dietPlanId/:planAssignemnetId',
        component: DietPlan,
      },
      {
        path: 'client-workout-plan/:workoutPlanId/:planAssignemnetId',
        component: WorkoutPlan,
      },
      { path: 'progress', component: Progress },
      { path: 'stats-analytics', component: Stats },
      { path: 'chatClient', component: ChatComponent },
    ],
  },
  {
    path: '',
    component: Adminlayout,
    canActivate: [AuthGuard],
    data: { roles: ['Admin'] },
    children: [
      { path: 'coaches', component: AdminDashboard },
      { path: 'clients', component: AdminDashboardClient },
    ],
  },
  { path: 'unauthorized', component: Unauthorized },
];
