import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const usePlayerStore = create((set, get) => ({
  displayName: '',
  money: 0,
  sessions_count: 0,
  isLoading: false,
  error: null,

  setProfile: (profile) => set({
    displayName: profile.full_name || '',
    money: profile.money || 0,
    sessions_count: profile.sessions_count || 0
  }),

  fetchProfile: async (userId) => {
    if (!userId) return;
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      if (data) {
        set({
          displayName: data.full_name || '',
          money: data.money || 0,
          sessions_count: data.sessions_count || 0,
          isLoading: false
        });
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
      set({ error: err.message, isLoading: false });
    }
  },

  syncUserProfile: async (user) => {
    if (!user) return;
    
    const fullName = user.user_metadata?.full_name || 'Học viên';
    const email = user.email;

    try {
      // 1. Kiểm tra xem profile đã tồn tại chưa
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();

      if (fetchError) throw fetchError;

      let finalData;

      if (!existingProfile) {
        // 2. Nếu chưa có, thực hiện INSERT thông tin mới
        console.log('DEBUG: Tạo profile mới cho user:', user.id);
        const { data: newData, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: fullName,
            email: email,
            money: 0,
            sessions_count: 1
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        finalData = newData;
      } else {
        // 3. Nếu đã có, thực hiện UPDATE (chỉ full_name và email)
        console.log('DEBUG: Cập nhật profile cũ cho user:', user.id);
        const { data: updatedData, error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            email: email,
            // Không chạm vào money và sessions_count
          })
          .eq('id', user.id)
          .select()
          .single();

        if (updateError) throw updateError;
        finalData = updatedData;
      }

      // 4. Cập nhật vào Zustand store
      if (finalData) {
        set({
          displayName: finalData.full_name,
          money: finalData.money,
          sessions_count: finalData.sessions_count
        });
      }
    } catch (err) {
      console.error('Error syncing profile:', err.message);
    }
  }
}));

export default usePlayerStore;
