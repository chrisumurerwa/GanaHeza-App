import { Tabs, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Colors from '@/constants/colors';
import { useCart } from '@/context/CartContext';

const LOGO = require('@/assets/images/Ganaheza LOGO.png');

// ─── Top Brand Header ─────────────────────────────────────────────────────────
function TopHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { totalItems } = useCart();

  return (
    <View style={[styles.header, { paddingTop: insets.top }]}>
      {/* Green accent bar at top */}
      <View style={styles.headerAccent} />

      <View style={styles.headerInner}>
        {/* Left: Logo taps to home */}
        <TouchableOpacity
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
          style={styles.logoTouchable}
          accessibilityLabel="GanaHeza home"
          accessibilityHint="Returns to the home page"
        >
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </TouchableOpacity>

        {/* Right: action icons */}
        <View style={styles.headerActions}>

          {/* Cart icon */}
          <TouchableOpacity
            style={styles.iconBtn}
            onPress={() => router.push('/cart')}
            activeOpacity={0.8}
            accessibilityLabel="Cart"
          >
            <Ionicons name="cart-outline" size={21} color={Colors.textMain} />
            {totalItems > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{totalItems > 9 ? '9+' : totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>

          {/* Login / Profile */}
          <TouchableOpacity
            style={[styles.iconBtn, styles.loginIconBtn]}
            onPress={() => router.push('/login')}
            activeOpacity={0.8}
            accessibilityLabel="Login"
          >
            <Ionicons name="person-outline" size={19} color={Colors.white} />
          </TouchableOpacity>

        </View>
      </View>
    </View>
  );
}

// ─── Bottom Tab Bar ───────────────────────────────────────────────────────────
function BottomTabBar({ state, navigation }) {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const TABS = [
    { name: 'index',    label: 'Home',     icon: 'home',               iconOut: 'home-outline' },
    { name: 'products', label: 'Products', icon: 'leaf',               iconOut: 'leaf-outline' },
    { name: 'blog',     label: 'Blog',     icon: 'newspaper',          iconOut: 'newspaper-outline' },
    { name: 'about',    label: 'About',    icon: 'information-circle', iconOut: 'information-circle-outline' },
  ];

  // Show back button only when not on the first tab (Home)
  const canGoBack = state.index > 0;

  return (
    <View style={[styles.tabBar, { paddingBottom: Math.max(insets.bottom, 8) }]}>
      {/* Back button — only when not on Home */}
      {canGoBack && (
        <TouchableOpacity
          style={styles.backTabBtn}
          onPress={() => navigation.navigate(state.routes[state.index - 1].name)}
          activeOpacity={0.75}
        >
          <Ionicons name="chevron-back" size={20} color={Colors.textSecondary} />
          <Text style={styles.backTabLabel}>Back</Text>
        </TouchableOpacity>
      )}

      {/* Tab items */}
      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const tab = TABS.find((t) => t.name === route.name) ?? TABS[0];

        function onPress() {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            style={styles.tabItem}
            onPress={onPress}
            activeOpacity={0.75}
          >
            {isFocused && <View style={styles.activeBar} />}
            <Ionicons
              name={isFocused ? tab.icon : tab.iconOut}
              size={22}
              color={isFocused ? Colors.primary : '#AAAAAA'}
            />
            <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}

      {/* Quick contact action, positioned after About */}
      <TouchableOpacity
        style={styles.tabItem}
        onPress={() => router.push('/contact')}
        activeOpacity={0.75}
        accessibilityLabel="Chat with us"
        accessibilityHint="Opens the contact page"
      >
        <Ionicons name="chatbubble-ellipses-outline" size={22} color="#AAAAAA" />
        <Text style={styles.tabLabel}>Chat</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Main Layout ─────────────────────────────────────────────────────────────
export default function TabLayout() {
  return (
    <>
      <TopHeader />
      <Tabs
        tabBar={(props) => <BottomTabBar {...props} />}
        screenOptions={{
          headerShown: false,
          sceneStyle: { backgroundColor: Colors.background },
        }}
      >
        <Tabs.Screen name="index"    options={{ title: 'Home' }} />
        <Tabs.Screen name="products" options={{ title: 'Products' }} />
        <Tabs.Screen name="blog"     options={{ title: 'Blog' }} />
        <Tabs.Screen name="about"    options={{ title: 'About' }} />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  // ── Top Header ─────────────────────────────────────
  header: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.cardBorder,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.10,
    shadowRadius: 6,
  },
  headerAccent: {
    height: 3,
    backgroundColor: Colors.primary,
  },
  headerInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  logoTouchable: {
    // slight padding so tap target is bigger
    paddingVertical: 4,
  },
  logo: {
    width: 130,
    height: 42,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    position: 'relative',
  },
  loginIconBtn: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -5,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: Colors.white,
  },
  badgeText: { fontSize: 9, color: Colors.white, fontWeight: '800' },

  // ── Bottom Tab Bar ──────────────────────────────────
  tabBar: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.cardBorder,
    paddingTop: 6,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.10,
    shadowRadius: 8,
    alignItems: 'center',
  },
  backTabBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    gap: 2,
    borderRightWidth: 1,
    borderRightColor: Colors.cardBorder,
    marginRight: 2,
  },
  backTabLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 5,
    gap: 3,
    position: 'relative',
  },
  activeBar: {
    position: 'absolute',
    top: 0,
    left: '25%',
    right: '25%',
    height: 3,
    borderRadius: 2,
    backgroundColor: Colors.primary,
  },
  tabLabel: { fontSize: 11, fontWeight: '700', color: '#666666' },
  tabLabelActive: { color: Colors.primary, fontWeight: '800' },
});
