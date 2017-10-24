import React from 'react'
import {StyleSheet, View, StatusBar} from 'react-native'
import MainNavigator from './src/navigation/MainNavigator'

export default class App extends React.Component {
	render() {
		console.log("App rendered")
		return (
			<View style={styles.app}>
				<MainNavigator />
			</View>

		);
	}
}

const styles = StyleSheet.create({
	app: {
		flex: 1,
		marginTop: StatusBar.currentHeight,
	},
});