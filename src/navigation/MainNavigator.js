import {StackNavigator} from 'react-navigation'
import HomeScreen from '../screens/HomeScreen'

export default MainStack = StackNavigator({
		Home: {screen: HomeScreen},
	}
// , {
// 	navigationOptions: ({navigation}) => ({
// 		// headerRight: <TouchableOpacity onPress={() => navigation.navigate('Parking')}>
// 		headerRight: <TouchableOpacity onPress={() => NativeModules.ActivityStarter.navigateToExample2()}>
// 			<Icons name="ios-car" size={28} color="white" />
// 		</TouchableOpacity>,
// 		headerLeft: <DrawerButton title="Drawer" navigation={navigation} />,
// 		headerStyle: {
// 			backgroundColor: 'black'
// 		},
// 	}),
// }
)