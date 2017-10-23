import React from 'react'
import {View, StyleSheet, FlatList, Text, Modal, TouchableHighlight, Button} from 'react-native'

// Modal components used to show calculated salary data
export default class ShowModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			modalVisible: props.modalVisible,
		}
	}

	setModalVisible(visible) {
		this.setState({modalVisible: visible})
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
						<FlatList
							data={this.props.users}
							// keyExtractor={item => item.Date}
							renderItem={({item}) =>
								<View style={styles.container}>
									<Text style={{
										flex: 0.5,
										flexDirection: 'row',
										justifyContent: 'center',
										textAlign: 'right',
										alignItems: 'center',
										backgroundColor: 'blue',
									}}>{item.name}</Text>
									<Text style={{flex: 3}}>{item.salary}</Text>

								</View>

							}
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
					title="Calculate"
					color="#841584"
					accessibilityLabel="Learn more about this purple button"
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