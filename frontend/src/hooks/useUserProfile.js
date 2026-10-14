import { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../api/client';

/**
 * Custom hook to fetch and manage user profile data
 * Automatically updates when user changes or profile is updated
 */
export const useUserProfile = () => {
  const { user, profileRefreshTrigger } = useApp();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Try to fetch from API, fallback to user context
        let profileData = user;
        try {
          const apiProfile = await api.profile.get(user.id);
          profileData = { ...user, ...apiProfile };
        } catch (apiError) {
          console.warn('Profile API unavailable, using context data:', apiError.message);
        }

        setProfile(profileData);
      } catch (err) {
        setError(err.message);
        setProfile(user); // Fallback to user from context
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id, profileRefreshTrigger]);

  return { profile, loading, error };
};
