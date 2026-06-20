import { useApp } from '../storage';

/**
 * Custom hook to load and manage logged activities from the application storage context.
 *
 * @returns Logged activities array and functions to log/remove activities.
 */
export function useStoredActivities() {
  const { state, logActivity, removeActivity } = useApp();

  return {
    activities: state.activities,
    logActivity,
    removeActivity,
  };
}
