import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export const useDashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      fetchDashboard();
    } else {
      setDashboardData(null);
      setLoading(false);
    }
  }, [user]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setDashboardData(null);
        setLoading(false);
        return;
      }

      const email = user.email || '';
      const nameFromMeta = user.user_metadata?.name;
      const nameFallback = email ? email.split('@')[0] : 'Usuário';
      const validRoles = ['funcionario', 'gerente', 'admin', 'caixa', 'franqueado'];
      const metaRole = user.user_metadata?.role;
      const userRole = validRoles.includes(metaRole) ? metaRole : 'funcionario';

      const { error: upsertError } = await supabase.from('users').upsert(
        {
          id: user.id,
          email,
          name: nameFromMeta || nameFallback,
          role: userRole,
          is_active: true,
        },
        { onConflict: 'id' }
      );

      if (upsertError) throw upsertError;

      // Buscar dados completos do dashboard
      const { data, error } = await supabase
        .rpc('get_user_dashboard', {
          user_id_param: user.id
        });

      if (error) throw error;

      setDashboardData(data);
    } catch (err) {
      console.error('Erro ao buscar dashboard:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboardData,
    loading,
    error,
    refetch: fetchDashboard,
  };
};
