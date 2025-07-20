/**
 * Messaging API for Lise Defteri
 * This file contains functions for handling messaging functionality using Supabase
 */

// Create a namespace for messaging API
window.messagingApi = {
  /**
   * Get all conversations for the current user
   * @returns {Promise<Array>} Array of conversations
   */
  getConversations: async function() {
    try {
      const { data: { user } } = await window.supabase.auth.getUser();
      if (!user) throw new Error('Kullanıcı oturumu bulunamadı');
      
      // Get conversations from the view
      const { data, error } = await window.supabase
        .from('conversation_list_view')
        .select('*')
        .eq('profile_id', user.id)
        .order('latest_message_time', { ascending: false });
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
    console.error('Konuşmalar alınırken hata oluştu:', error.message);
    throw error;
  }
  },

  /**
   * Belirli bir konuşmanın mesajlarını getirir
   * @param {string} conversationId - Konuşma ID'si
   * @param {number} limit - Getirilecek mesaj sayısı
   * @param {number} offset - Atlanacak mesaj sayısı (sayfalama için)
   * @returns {Promise<Array>} Mesajların listesi
   */
  getMessages: async function(conversationId, limit = 50, offset = 0) {
    try {
    const { data, error } = await window.supabase
      .from('messages')
      .select(`
        id,
        content,
        created_at,
        updated_at,
        is_edited,
        is_deleted,
        sender_id,
        profiles:sender_id(username, full_name, avatar_url)
      `)
      .eq('conversation_id', conversationId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) throw error;
    
    // Mesajları okundu olarak işaretle
    await this.markMessagesAsRead(data.map(msg => msg.id));
    
      return data;
    } catch (error) {
      console.error('Mesajlar getirilirken hata oluştu:', error.message);
      throw error;
    }
  },

  /**
   * Mesajları okundu olarak işaretler
   * @param {Array<string>} messageIds - Mesaj ID'leri
   * @returns {Promise<void>}
   */
  markMessagesAsRead: async function(messageIds) {
    if (!messageIds || messageIds.length === 0) return;
    
    try {
      const { error } = await window.supabase
        .from('message_read_status')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .in('message_id', messageIds)
        .eq('profile_id', this.getCurrentUserId());

      if (error) throw error;
    } catch (error) {
      console.error('Mesajlar okundu olarak işaretlenirken hata oluştu:', error.message);
    }
  },

  /**
   * Yeni bir mesaj gönderir
   * @param {string} conversationId - Konuşma ID'si
   * @param {string} content - Mesaj içeriği
   * @returns {Promise<Object>} Gönderilen mesaj
   */
  sendMessage: async function(conversationId, content) {
    try {
      const { data, error } = await window.supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: this.getCurrentUserId(),
          content: content
        })
        .select(`
          id,
          content,
          created_at,
          updated_at,
          is_edited,
          is_deleted,
          sender_id,
          profiles:sender_id(username, full_name, avatar_url)
        `)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Mesaj gönderilirken hata oluştu:', error.message);
      throw error;
    }
  },

  /**
   * Bir mesajı düzenler
   * @param {string} messageId - Mesaj ID'si
   * @param {string} newContent - Yeni mesaj içeriği
   * @returns {Promise<Object>} Düzenlenen mesaj
   */
  editMessage: async function(messageId, newContent) {
    try {
      const { data, error } = await window.supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', this.getCurrentUserId())
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Mesaj düzenlenirken hata oluştu:', error.message);
      throw error;
    }
  },

  /**
   * Bir mesajı siler (soft delete)
   * @param {string} messageId - Mesaj ID'si
   * @returns {Promise<void>}
   */
  deleteMessage: async function(messageId) {
    try {
      const { error } = await window.supabase
        .from('messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', this.getCurrentUserId());

      if (error) throw error;
    } catch (error) {
      console.error('Mesaj silinirken hata oluştu:', error.message);
      throw error;
    }
  },

  /**
   * Yeni bir konuşma oluşturur
   * @param {string} title - Konuşma başlığı (grup konuşması için)
   * @param {boolean} isGroup - Grup konuşması mı?
   * @param {Array<string>} participantIds - Katılımcı ID'leri
   * @returns {Promise<Object>} Oluşturulan konuşma
   */
  createConversation: async function(title = null, isGroup = false, participantIds = []) {
    try {
      // Mevcut kullanıcıyı katılımcılara ekle
      const currentUserId = this.getCurrentUserId();
      if (!participantIds.includes(currentUserId)) {
        participantIds.push(currentUserId);
      }

      // Eğer grup değilse ve sadece 2 kişi varsa, bu iki kişi arasında zaten bir konuşma var mı kontrol et
      if (!isGroup && participantIds.length === 2) {
        const existingConversation = await this.findDirectConversation(participantIds[0], participantIds[1]);
        if (existingConversation) return existingConversation;
      }

      // Yeni konuşma oluştur
      const { data: conversation, error: conversationError } = await window.supabase
        .from('conversations')
        .insert({
          title: title,
          is_group: isGroup
        })
        .select()
        .single();

      if (conversationError) throw conversationError;

      // Katılımcıları ekle
      const participantsToInsert = participantIds.map(profileId => ({
        conversation_id: conversation.id,
        profile_id: profileId,
        is_admin: profileId === currentUserId // Oluşturan kişi admin olsun
      }));

      const { error: participantsError } = await window.supabase
        .from('conversation_participants')
        .insert(participantsToInsert);

      if (participantsError) throw participantsError;

      return conversation;
    } catch (error) {
      console.error('Konuşma oluşturulurken hata oluştu:', error.message);
      throw error;
    }
  },

  /**
   * İki kullanıcı arasındaki direkt konuşmayı bulur
   * @param {string} user1Id - Birinci kullanıcı ID'si
   * @param {string} user2Id - İkinci kullanıcı ID'si
   * @returns {Promise<Object|null>} Konuşma veya null
   */
  findDirectConversation: async function(user1Id, user2Id) {
    try {
      // Kullanıcı 1'in katıldığı konuşmaları bul
      const { data: user1Conversations, error: user1Error } = await window.supabase
        .from('conversation_participants')
        .select('conversation_id')
        .eq('profile_id', user1Id);

      if (user1Error) throw user1Error;
      if (!user1Conversations.length) return null;

      // Kullanıcı 1'in konuşmalarından, kullanıcı 2'nin de katıldığı ve grup olmayan konuşmaları bul
      const conversationIds = user1Conversations.map(c => c.conversation_id);
      
      const { data: matchingConversations, error: matchingError } = await window.supabase
        .from('conversations')
        .select(`
          id,
          title,
          is_group,
          created_at,
          updated_at,
          conversation_participants!inner(profile_id)
        `)
        .in('id', conversationIds)
        .eq('is_group', false)
        .eq('conversation_participants.profile_id', user2Id);

      if (matchingError) throw matchingError;
      if (!matchingConversations.length) return null;

      // Sadece iki kişinin olduğu konuşmaları filtrele
      for (const conv of matchingConversations) {
        const { data: participants, error: participantsError } = await window.supabase
          .from('conversation_participants')
          .select('profile_id')
          .eq('conversation_id', conv.id);

        if (participantsError) throw participantsError;
        if (participants.length === 2) {
          return conv;
        }
      }

      return null;
    } catch (error) {
      console.error('Direkt konuşma aranırken hata oluştu:', error.message);
      return null;
    }
  },

  /**
   * Bir konuşmaya katılımcı ekler
   * @param {string} conversationId - Konuşma ID'si
   * @param {string} profileId - Eklenecek kullanıcı ID'si
   * @param {boolean} isAdmin - Admin yetkisi verilsin mi?
   * @returns {Promise<void>}
   */
  addParticipantToConversation: async function(conversationId, profileId, isAdmin = false) {
    try {
      const { error } = await window.supabase
        .from('conversation_participants')
        .insert({
          conversation_id: conversationId,
          profile_id: profileId,
          is_admin: isAdmin
        });

      if (error) throw error;
    } catch (error) {
      console.error('Katılımcı eklenirken hata oluştu:', error.message);
      throw error;
    }
  },

  /**
   * Bir konuşmadan katılımcı çıkarır
   * @param {string} conversationId - Konuşma ID'si
   * @param {string} profileId - Çıkarılacak kullanıcı ID'si
   * @returns {Promise<void>}
   */
  removeParticipantFromConversation: async function(conversationId, profileId) {
    try {
      const { error } = await window.supabase
        .from('conversation_participants')
        .delete()
        .eq('conversation_id', conversationId)
        .eq('profile_id', profileId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Katılımcı çıkarılırken hata oluştu:', error.message);
      throw error;
    }
  },

/**
   * Bir konuşmanın katılımcılarını getirir
   * @param {string} conversationId - Konuşma ID'si
   * @returns {Promise<Array>} - Katılımcı listesi
   */
  getConversationParticipants: async function(conversationId) {
    try {
      const { data, error } = await window.supabase
        .from('conversation_members')
        .select('*')
        .eq('conversation_id', conversationId);

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Konuşma detayları getirilirken hata oluştu:', error.message);
      throw error;
    }
  },

/**
   * Bir konuşmanın detaylarını getirir
   * @param {string} conversationId - Konuşma ID'si
   * @returns {Promise<Object>} - Konuşma detayları
   */
  getConversationDetails: async function(conversationId) {
    try {
      const { data, error } = await window.supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Konuşma katılımcıları getirilirken hata oluştu:', error.message);
      return [];
    }
  },

/**
   * Bir konuşmanın başlığını günceller
   * @param {string} conversationId - Konuşma ID'si
   * @param {string} newTitle - Yeni başlık
   * @returns {Promise<void>}
   */
  updateConversationTitle: async function(conversationId, newTitle) {
    try {
      const { data, error } = await window.supabase
        .from('conversations')
        .update({ title: newTitle })
        .eq('id', conversationId)
        .select()
        .single();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Konuşma başlığı güncellenirken hata oluştu:', error.message);
      throw error;
    }
  },

/**
   * Bir konuşmayı siler
   * @param {string} conversationId - Silinecek konuşma ID'si
   * @returns {Promise<void>}
   */
  deleteConversation: async function(conversationId) {
    try {
      const { error } = await window.supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
    } catch (error) {
      console.error('Konuşma silinirken hata oluştu:', error.message);
      throw error;
    }
  },

  /**
   * Mevcut kullanıcının ID'sini getirir
   * @returns {string|null} - Kullanıcı ID'si veya null
   */
  getCurrentUserId: function() {
    const user = window.supabase.auth.user();
    if (!user) throw new Error('Kullanıcı oturumu bulunamadı.');
    return user.id;
  },

/**
   * Belirli bir konuşmadaki mesaj güncellemelerine abone olur
   * @param {string} conversationId - Konuşma ID'si
   * @param {Function} callback - Yeni mesaj geldiğinde çağrılacak fonksiyon
   * @returns {Object} - Aboneliği sonlandırmak için kullanılacak nesne
   */
  subscribeToMessages: function(conversationId, callback) {
    return window.supabase
      .from(`messages:conversation_id=eq.${conversationId}`)
      .on('INSERT', payload => {
        callback(payload.new, 'insert');
      })
      .on('UPDATE', payload => {
        callback(payload.new, 'update');
      })
      .subscribe();
  },

  /**
   * Kullanıcının konuşma güncellemelerine abone olur
   * @param {Function} callback - Yeni konuşma geldiğinde çağrılacak fonksiyon
   * @returns {Object} - Aboneliği sonlandırmak için kullanılacak nesne
   */
  subscribeToConversations: function(callback) {
    const currentUserId = this.getCurrentUserId();
    
    return window.supabase
      .from(`conversation_participants:profile_id=eq.${currentUserId}`)
      .on('INSERT', async payload => {
        const conversationId = payload.new.conversation_id;
        const { data } = await window.supabase
          .from('conversation_list_view')
          .select('*')
          .eq('id', conversationId)
          .single();
        
        callback(data, 'insert');
      })
      .subscribe();
  }
}