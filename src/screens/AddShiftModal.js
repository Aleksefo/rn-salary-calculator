import React from 'react'
import {View, StyleSheet, AsyncStorage, Modal, Button} from 'react-native'
import {Kaede} from 'react-native-textinput-effects'

// Modal components used to show calculated salary data
export default class AddShiftModal extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modalVisible: props.modalVisible,
		}
	}

	setModalVisible(visible) {
		this.setState({modalVisible: visible})
	}

	// Saves new shift to the local storage
	async addShift() {
		try {
			await AsyncStorage.getItem('CSVData')
				.then(keys => {
					keys = keys === null ? [] : JSON.parse(keys)
					keys.push((this.state))
					AsyncStorage.setItem('CSVData', JSON.stringify(keys))
					// Sends callback to parent to update FlatList
					this.props.onAddShift()
				})
		} catch (error) {
			console.log('CSVData saving error ' + error)
		}
		this.setModalVisible(!this.state.modalVisible)
	}

	render() {
		const {modal, buttonsGroup, button} = styles
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
					<View style={modal}>
						<Kaede
							label={"Person ID"}
							onChangeText={(id) => this.setState({['Person ID']: id})}
						/>
						<Kaede
							label={"Person Name"}
							onChangeText={(name) => this.setState({['Person Name']: name})}
						/>
						<Kaede
							label={"Date"}
							onChangeText={(date) => this.setState({Date: date})}
						/>
						<Kaede
							label={"Shift Start"}
							onChangeText={(start) => this.setState({Start: start})}
						/>
						<Kaede
							label={"Shift End"}
							onChangeText={(end) => this.setState({End: end})}
						/>
						<View style={buttonsGroup}>
							<View style={button}>
								<Button
									onPress={() => this.addShift()}
									title="Add shift"
									color="#4DA6EF"
									accessibilityLabel="Add new shift"
								/>
							</View>
							<View style={button}>
								<Button
									onPress={() => this.setModalVisible(!this.state.modalVisible)}
									title="Cancel"
									color="#4DA6EF"
									accessibilityLabel="Learn more about this purple button"
								/>
							</View>
						</View>

					</View>
				</Modal>
				<Button
					onPress={() => this.setModalVisible(true)}
					title="Add shift"
					color="#4DA6EF"
					accessibilityLabel="Add a shift"
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	modal: {
		flex: 1,
		margin: 50,
	},
	buttonsGroup: {
		flexDirection: 'row'
	},
	button: {
		flex: 1,
		margin: 5
	},
})