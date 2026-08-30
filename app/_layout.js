import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ProductProvider } from '@/context/ProductContext';
import { CartProvider } from '@/context/CartContext';
import { LanguageProvider, useLanguage } from '@/context/LanguageContext';

const HEADER_STYLE = {
  backgroundColor: '#FFFFFF',
};
const HEADER_TITLE_STYLE = { fontWeight: '700', color: '#1B1B1B' };

// Inner layout that can use the language context
function AppStack() {
  const { t } = useLanguage();
  return (
    <>
      <StatusBar style="dark" backgroundColor="#FFFFFF" translucent={false} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)"    options={{ headerShown: false }} />
        <Stack.Screen name="login"     options={{ headerShown: false }} />
        <Stack.Screen name="dashboard" options={{ headerShown: false }} />
        <Stack.Screen name="cart"      options={{ headerShown: false }} />
        <Stack.Screen name="order"     options={{ headerShown: false }} />
        <Stack.Screen
          name="product-details"
          options={{ headerShown: true, title: t('header_product_details'), headerStyle: HEADER_STYLE, headerTintColor: '#2E7D32', headerTitleStyle: HEADER_TITLE_STYLE }}
        />
        <Stack.Screen
          name="blog-details"
          options={{ headerShown: true, title: t('header_article'), headerStyle: HEADER_STYLE, headerTintColor: '#2E7D32', headerTitleStyle: HEADER_TITLE_STYLE }}
        />
        <Stack.Screen
          name="contact"
          options={{ headerShown: true, title: t('header_contact'), headerStyle: HEADER_STYLE, headerTintColor: '#2E7D32', headerTitleStyle: HEADER_TITLE_STYLE }}
        />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <LanguageProvider>
          <ProductProvider>
            <CartProvider>
              <AppStack />
            </CartProvider>
          </ProductProvider>
        </LanguageProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
