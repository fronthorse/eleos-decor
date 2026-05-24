"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "../lib/supabase/client";
import { getSessionSafely } from "../lib/supabase/auth";

const CHAT_MESSAGES_KEY = "eleos_ai_chat_messages";
const CHAT_PREFERENCES_KEY = "eleos_ai_chat_preferences";
const CHAT_OPEN_KEY = "eleos_ai_chat_open";
const CHAT_UPDATED_AT_KEY = "eleos_ai_chat_updated_at";
const LEGACY_CHAT_KEYS = [
  CHAT_MESSAGES_KEY,
  CHAT_PREFERENCES_KEY,
  CHAT_OPEN_KEY,
  CHAT_UPDATED_AT_KEY,
];

function canUseStorage() {
  return typeof window !== "undefined" && window.localStorage;
}

function safeParse(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Unable to parse saved AI chat data.", error);
    return fallback;
  }
}

function normalizeMessages(messages, defaultMessages) {
  return Array.isArray(messages) && messages.length > 0
    ? messages
    : defaultMessages;
}

function getScopedStorageKey(key, storageScope) {
  return `${key}_${storageScope || "guest"}`;
}

function removeLegacyLocalChat() {
  if (!canUseStorage()) {
    return;
  }

  LEGACY_CHAT_KEYS.forEach((key) => window.localStorage.removeItem(key));
}

function removeAllScopedLocalChat() {
  if (!canUseStorage()) {
    return;
  }

  const chatKeyPrefixes = LEGACY_CHAT_KEYS.map((key) => `${key}_`);

  Object.keys(window.localStorage).forEach((key) => {
    if (LEGACY_CHAT_KEYS.includes(key)) {
      window.localStorage.removeItem(key);
      return;
    }

    if (chatKeyPrefixes.some((prefix) => key.startsWith(prefix))) {
      window.localStorage.removeItem(key);
    }
  });
}

export function loadLocalChat(
  defaultMessages,
  defaultPreferences,
  storageScope = "guest"
) {
  if (!canUseStorage()) {
    return {
      messages: defaultMessages,
      preferences: defaultPreferences,
      isOpen: false,
      updatedAt: null,
    };
  }

  return {
    messages: normalizeMessages(
      safeParse(
        window.localStorage.getItem(
          getScopedStorageKey(CHAT_MESSAGES_KEY, storageScope)
        ),
        defaultMessages
      ),
      defaultMessages
    ),
    preferences: {
      ...defaultPreferences,
      ...safeParse(
        window.localStorage.getItem(
          getScopedStorageKey(CHAT_PREFERENCES_KEY, storageScope)
        ),
        defaultPreferences
      ),
    },
    isOpen:
      window.localStorage.getItem(
        getScopedStorageKey(CHAT_OPEN_KEY, storageScope)
      ) === "true",
    updatedAt: window.localStorage.getItem(
      getScopedStorageKey(CHAT_UPDATED_AT_KEY, storageScope)
    ),
  };
}

export function saveLocalChat(
  messages,
  preferences,
  isOpen,
  storageScope = "guest"
) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    getScopedStorageKey(CHAT_MESSAGES_KEY, storageScope),
    JSON.stringify(messages)
  );
  window.localStorage.setItem(
    getScopedStorageKey(CHAT_PREFERENCES_KEY, storageScope),
    JSON.stringify(preferences)
  );
  window.localStorage.setItem(
    getScopedStorageKey(CHAT_OPEN_KEY, storageScope),
    JSON.stringify(isOpen)
  );
  window.localStorage.setItem(
    getScopedStorageKey(CHAT_UPDATED_AT_KEY, storageScope),
    new Date().toISOString()
  );
}

export function clearLocalChat(storageScope = "guest") {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(
    getScopedStorageKey(CHAT_MESSAGES_KEY, storageScope)
  );
  window.localStorage.removeItem(
    getScopedStorageKey(CHAT_PREFERENCES_KEY, storageScope)
  );
  window.localStorage.removeItem(getScopedStorageKey(CHAT_OPEN_KEY, storageScope));
  window.localStorage.removeItem(
    getScopedStorageKey(CHAT_UPDATED_AT_KEY, storageScope)
  );
}

function shouldPreferLocal(localChat, remoteChat) {
  const localCount = localChat.messages?.length || 0;
  const remoteCount = remoteChat?.messages?.length || 0;

  if (localCount > remoteCount) {
    return true;
  }

  if (!localChat.updatedAt || !remoteChat?.updated_at) {
    return false;
  }

  return new Date(localChat.updatedAt) > new Date(remoteChat.updated_at);
}

export function useAIDecorChatPersistence({
  messages,
  setMessages,
  preferences,
  setPreferences,
  isOpen,
  setIsOpen,
  defaultMessages,
  defaultPreferences,
}) {
  const supabase = useMemo(() => createClient(), []);
  const [user, setUser] = useState(null);
  const [hasResolvedAuth, setHasResolvedAuth] = useState(false);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [hasLoadedLocalChat, setHasLoadedLocalChat] = useState(false);
  const [hasLoadedUserChat, setHasLoadedUserChat] = useState(false);
  const localChatRef = useRef(null);
  const saveTimerRef = useRef(null);
  const currentUserIdRef = useRef(null);
  const isClearingRef = useRef(false);
  const skipNextLoadRef = useRef(false);
  const clearVersionRef = useRef(0);
  const storageScope = user?.id ? `user_${user.id}` : "guest";

  const cancelDebouncedSave = useCallback(() => {
    if (saveTimerRef.current) {
      window.clearTimeout(saveTimerRef.current);
      saveTimerRef.current = null;
    }
  }, []);

  const loadUserChat = useCallback(
    async (userId) => {
      const { data, error } = await supabase
        .from("ai_chat_sessions")
        .select("id,messages,preferences,updated_at")
        .eq("user_id", userId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Unable to load saved AI chat session.", error.message);
        return null;
      }

      return data;
    },
    [supabase]
  );

  const saveUserChat = useCallback(
    async (userId, nextMessages, nextPreferences, sessionId = activeSessionId) => {
      const updatedAt = new Date().toISOString();
      const payload = {
        user_id: userId,
        messages: normalizeMessages(nextMessages, defaultMessages),
        preferences: nextPreferences || defaultPreferences,
        updated_at: updatedAt,
      };

      if (sessionId) {
        const { data, error } = await supabase
          .from("ai_chat_sessions")
          .update(payload)
          .eq("id", sessionId)
          .eq("user_id", userId)
          .lt("updated_at", updatedAt)
          .select("id")
          .maybeSingle();

        if (error) {
          console.error("Unable to update saved AI chat session.", error.message);
          return null;
        }

        return data || { id: sessionId };
      }

      const { data: existingSession, error: loadError } = await supabase
        .from("ai_chat_sessions")
        .select("id")
        .eq("user_id", userId)
        .limit(1)
        .maybeSingle();

      if (loadError) {
        console.error("Unable to check saved AI chat session.", loadError.message);
        return null;
      }

      if (existingSession?.id) {
        const { data, error } = await supabase
          .from("ai_chat_sessions")
          .update(payload)
          .eq("id", existingSession.id)
          .eq("user_id", userId)
          .lt("updated_at", updatedAt)
          .select("id")
          .maybeSingle();

        if (error) {
          console.error("Unable to save AI chat session.", error.message);
          return null;
        }

        return data || existingSession;
      }

      const { data, error } = await supabase
        .from("ai_chat_sessions")
        .insert(payload)
        .select("id")
        .maybeSingle();

      if (error) {
        if (error.code !== "23505") {
          console.error("Unable to save AI chat session.", error.message);
          return null;
        }

        const { data: conflictedSession, error: conflictLoadError } =
          await supabase
            .from("ai_chat_sessions")
            .select("id")
            .eq("user_id", userId)
            .limit(1)
            .maybeSingle();

        if (conflictLoadError || !conflictedSession?.id) {
          if (conflictLoadError) {
            console.error(
              "Unable to recover AI chat session save.",
              conflictLoadError.message
            );
          }

          return null;
        }

        const { data: recoveredSession, error: recoverError } = await supabase
          .from("ai_chat_sessions")
          .update(payload)
          .eq("id", conflictedSession.id)
          .eq("user_id", userId)
          .lt("updated_at", updatedAt)
          .select("id")
          .maybeSingle();

        if (recoverError) {
          console.error("Unable to save AI chat session.", recoverError.message);
          return null;
        }

        return recoveredSession || conflictedSession;
      }

      return data;
    },
    [activeSessionId, defaultMessages, defaultPreferences, supabase]
  );

  const clearPersistedChat = useCallback(async () => {
    const clearVersion = clearVersionRef.current + 1;
    clearVersionRef.current = clearVersion;
    isClearingRef.current = true;
    skipNextLoadRef.current = true;
    cancelDebouncedSave();

    removeAllScopedLocalChat();
    clearLocalChat("guest");
    clearLocalChat(storageScope);

    if (user?.id) {
      clearLocalChat(`user_${user.id}`);
    }

    localChatRef.current = {
      messages: defaultMessages,
      preferences: defaultPreferences,
      isOpen,
      updatedAt: new Date().toISOString(),
    };

    setMessages(defaultMessages);
    setPreferences(defaultPreferences);
    saveLocalChat(defaultMessages, defaultPreferences, isOpen, storageScope);

    if (!user) {
      isClearingRef.current = false;
      return;
    }

    const saved = await saveUserChat(user.id, defaultMessages, defaultPreferences);

    if (clearVersionRef.current !== clearVersion) {
      isClearingRef.current = false;
      return;
    }

    if (saved?.id) {
      setActiveSessionId(saved.id);
    }

    isClearingRef.current = false;
  }, [
    cancelDebouncedSave,
    defaultMessages,
    defaultPreferences,
    isOpen,
    saveUserChat,
    setMessages,
    setPreferences,
    storageScope,
    user,
  ]);

  useEffect(() => {
    if (!hasResolvedAuth) {
      return;
    }

    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false;
      setHasLoadedLocalChat(true);
      return;
    }

    const localChat = loadLocalChat(
      defaultMessages,
      defaultPreferences,
      storageScope
    );
    localChatRef.current = localChat;
    setMessages(localChat.messages);
    setPreferences(localChat.preferences);
    setIsOpen(localChat.isOpen);
    setHasLoadedLocalChat(true);
  }, [
    defaultMessages,
    defaultPreferences,
    hasResolvedAuth,
    setIsOpen,
    setMessages,
    setPreferences,
    storageScope,
  ]);

  useEffect(() => {
    async function getCurrentUser() {
      const { session } = await getSessionSafely(supabase);
      const nextUser = session?.user || null;
      currentUserIdRef.current = nextUser?.id || null;
      setUser(nextUser);
      setHasResolvedAuth(true);
    }

    removeLegacyLocalChat();
    getCurrentUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const nextUser = session?.user || null;
      const nextUserId = nextUser?.id || null;
      const previousUserId = currentUserIdRef.current;
      const userChanged = nextUserId !== previousUserId;

      currentUserIdRef.current = nextUserId;
      setUser(nextUser);

      if (userChanged) {
        cancelDebouncedSave();
        clearVersionRef.current += 1;
        setMessages(defaultMessages);
        setPreferences(defaultPreferences);
        setIsOpen(false);
        setHasLoadedLocalChat(false);
        setHasLoadedUserChat(false);
        setActiveSessionId(null);
      }

      setHasResolvedAuth(true);
    });

    return () => subscription.unsubscribe();
  }, [
    defaultMessages,
    defaultPreferences,
    cancelDebouncedSave,
    setIsOpen,
    setMessages,
    setPreferences,
    supabase,
  ]);

  useEffect(() => {
    if (!hasLoadedLocalChat) {
      return;
    }

    if (isClearingRef.current) {
      setHasLoadedUserChat(true);
      return;
    }

    if (!user) {
      setHasLoadedUserChat(true);
      return;
    }

    let isCancelled = false;
    const loadVersion = clearVersionRef.current;

    async function migrateLocalChatToUser() {
      const localChat = localChatRef.current || {
        messages,
        preferences,
        updatedAt: null,
      };
      const remoteChat = await loadUserChat(user.id);

      if (isCancelled || clearVersionRef.current !== loadVersion) {
        return;
      }

      if (!remoteChat) {
        const localMessages = normalizeMessages(
          localChat.messages,
          defaultMessages
        );
        const localPreferences = {
          ...defaultPreferences,
          ...(localChat.preferences || {}),
        };
        const saved = await saveUserChat(
          user.id,
          localMessages,
          localPreferences
        );

        if (
          !isCancelled &&
          clearVersionRef.current === loadVersion &&
          saved?.id
        ) {
          setActiveSessionId(saved.id);
        }

        if (isCancelled || clearVersionRef.current !== loadVersion) {
          return;
        }

        setMessages(localMessages);
        setPreferences(localPreferences);
        saveLocalChat(localMessages, localPreferences, isOpen, storageScope);
        setHasLoadedUserChat(true);
        return;
      }

      setActiveSessionId(remoteChat.id);

      if (shouldPreferLocal(localChat, remoteChat)) {
        const saved = await saveUserChat(
          user.id,
          localChat.messages,
          localChat.preferences,
          remoteChat.id
        );

        if (
          !isCancelled &&
          clearVersionRef.current === loadVersion &&
          saved?.id
        ) {
          setActiveSessionId(saved.id);
        }
      } else {
        const remoteMessages = normalizeMessages(
          remoteChat.messages,
          defaultMessages
        );
        const remotePreferences = {
          ...defaultPreferences,
          ...(remoteChat.preferences || {}),
        };

        if (!isCancelled && clearVersionRef.current === loadVersion) {
          setMessages(remoteMessages);
          setPreferences(remotePreferences);
          saveLocalChat(remoteMessages, remotePreferences, isOpen, storageScope);
        }
      }

      if (!isCancelled && clearVersionRef.current === loadVersion) {
        setHasLoadedUserChat(true);
      }
    }

    migrateLocalChatToUser();

    return () => {
      isCancelled = true;
    };
  }, [
    defaultMessages,
    defaultPreferences,
    hasLoadedLocalChat,
    isOpen,
    loadUserChat,
    messages,
    preferences,
    saveUserChat,
    setMessages,
    setPreferences,
    storageScope,
    user,
  ]);

  useEffect(() => {
    if (!hasLoadedLocalChat) {
      return;
    }

    if (isClearingRef.current) {
      return;
    }

    localChatRef.current = {
      messages,
      preferences,
      isOpen,
      updatedAt: new Date().toISOString(),
    };
    saveLocalChat(messages, preferences, isOpen, storageScope);
  }, [hasLoadedLocalChat, isOpen, messages, preferences, storageScope]);

  useEffect(() => {
    if (!hasLoadedLocalChat || !hasLoadedUserChat || !user) {
      return;
    }

    cancelDebouncedSave();
    const saveVersion = clearVersionRef.current;

    saveTimerRef.current = window.setTimeout(async () => {
      if (isClearingRef.current || clearVersionRef.current !== saveVersion) {
        return;
      }

      const saved = await saveUserChat(user.id, messages, preferences);

      if (
        !isClearingRef.current &&
        clearVersionRef.current === saveVersion &&
        saved?.id
      ) {
        setActiveSessionId(saved.id);
      }
    }, 1000);

    return cancelDebouncedSave;
  }, [
    cancelDebouncedSave,
    hasLoadedLocalChat,
    hasLoadedUserChat,
    messages,
    preferences,
    saveUserChat,
    user,
  ]);

  return {
    clearPersistedChat,
    user,
  };
}
