import React from 'react'
import {View, StyleSheet, FlatList, Text, Modal, Button} from 'react-native'

// Modal components used to show calculated salary data
export default class CalculateModal extends React.Component {
	constructor(props) {
		super(props)
		this.state = {
			modalVisible: props.modalVisible,
		}
	}

	setModalVisible(visible) {
		this.setState({modalVisible: visible})
	}

	render() {
		const {modal, flatListTitles, flatList, rowName, rowSalary} = styles
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
						<View style={flatListTitles}>
							<Text style={rowName}>Person name</Text>
							<Text style={rowSalary}>Total Salary</Text>
						</View>
						<FlatList
							data={this.props.users}
							keyExtractor={(item, index) => index}
							renderItem={({item}) =>
								<View style={flatList}>
									<Text style={rowName}>{item.name}</Text>
									<Text style={rowSalary}>{item.salary}</Text>
								</View>

							}
						/>
						<Button
							onPress={() => this.setModalVisible(!this.state.modalVisible)}
							title="Close"
							color="#4DA6EF"
							accessibilityLabel="Learn more about this purple button"
						/>
					</View>
				</Modal>
				<Button
					onPress={() => this.setModalVisible(true)}
					title="Calculate salaries"
					color="#4DA6EF"
					accessibilityLabel="Calculate salaries"
				/>
			</View>
		)
	}
}

const styles = StyleSheet.create({
	modal: {
		flex: 1,
		margin: 50,
		backgroundColor: '#ffd',
	},
	flatListTitles: {
		flexDirection: 'row',
		backgroundColor: '#4DA6EF',
	},
	flatList: {
		flex: 1,
		flexDirection: 'row',
		backgroundColor: '#ffd',
	},
	rowName: {
		flex: 1,
		textAlign: 'left',
		marginLeft: 10,
	},
	rowSalary: {
		flex: 1,
		textAlign: 'right',
		marginRight: 10,
	},
})