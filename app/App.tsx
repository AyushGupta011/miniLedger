import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { clearToken, loadToken, setUnauthorizedHandler } from './src/api';
import { HomeScreen } from './src/screens/HomeScreen';
import { LoginScreen } from './src/screens/LoginScreen';

export default function App() {
  const [ready, setReady] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const logout = async () => {
    await clearToken();
    setLoggedIn(false);
  };

  useEffect(() => {
    setUnauthorizedHandler(logout); // any 401 (expired token) sends the user back to login
    loadToken().then((t) => {
      setLoggedIn(!!t);
      setReady(true);
    });
  }, []);

  return (
    <SafeAreaProvider>
      {!ready ? (
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      ) : loggedIn ? (
        <HomeScreen onLogout={logout} />
      ) : (
        <LoginScreen onLoggedIn={() => setLoggedIn(true)} />
      )}
    </SafeAreaProvider>
  );
}

