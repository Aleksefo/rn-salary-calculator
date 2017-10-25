import React from 'react'
import {View, StyleSheet, AsyncStorage, Text, Modal, TouchableHighlight, Button} from 'react-native'
import {Kaede} from 'react-native-textinput-effects';

// Modal components used to show calculated salary data
export default class AddShiftModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: props.modalVisible,
		}
	}

	setModalVisible(visible) {
		this.setState({modalVisible: visible})
	}

	// Saves new shift to the local storage.
	async addShift() {
		try {
			await AsyncStorage.getItem('CSVData')
				.then(keys => {
					keys = keys === null ? [] : JSON.parse(keys)
					keys.push((this.state))
					AsyncStorage.setItem('CSVData', JSON.stringify(keys))
					this.props.onAddShift()
				})
		} catch (error) {
			console.log('CSVData saving error ' + error)
		}
		this.setModalVisible(!this.state.modalVisible)
	}

	render() {
		// const {} = styles
		return (
			<View>
				<Modal
					animationType="slide"
					transparent={false}
					visible={this.state.modalVisible}
					onRequestClose={() => {
						this.setModalVisible(false)
					}}
				>
					<View>
						<Kaede
							label={"Person ID"}
							// TextInput props
							onChangeText={(id) => this.setState({['Person ID']: id})}
						/>
						<Kaede
							label={"Person Name"}
							// TextInput props
							onChangeText={(name) => this.setState({['Person Name']: name})}
						/>
						<Kaede
							label={"Date"}
							// TextInput props
							onChangeText={(date) => this.setState({Date: date})}
						/>
						<Kaede
							label={"Shift Start"}
							// TextInput props
							onChangeText={(start) => this.setState({Start: start})}
						/>
						<Kaede
							label={"Shift End"}
							// TextInput props
							onChangeText={(end) => this.setState({End: end})}
						/>
						<Button
							onPress={() => this.addShift()}
							title="Add shift"
							color="#841884"
							accessibilityLabel="Add new shift"
						/>
						<Button
							onPress={() => console.log(this.state)}
							title="CurrentState"
							color="#841884"
							accessibilityLabel="Learn more about this purple button"
						/>
						<TouchableHighlight onPress={() => {
							this.setModalVisible(!this.state.modalVisible)
						}}>
							<Text>Hide Modal</Text>
						</TouchableHighlight>
					</View>
				</Modal>
				<Button
					onPress={() => this.setModalVisible(true)}
					title="Add shift"
					accessibilityLabel="Add a shift"
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: '#ffd',
		// alignItems: 'center',
		// justifyContent: 'center',

	},
})