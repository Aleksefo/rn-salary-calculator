import React from 'react';
import {Button, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Papa from 'papaparse'

export default class App extends React.Component {

	state = {
		modalVisible: false,
	}

	RateHourly = 3.75
	RateEvening = 1.15

	csvData = 'Person_Name,Person_ID,Date,Start,End\n' +
		'Scott Scala,2,2.3.2014,6:00,14:00\n' +
		'Janet Java,1,3.3.2014,9:30,17:00\n' +
		'Scott Scala,2,3.3.2014,8:15,16:00\n' +
		'Larry Lolcode,3,3.3.2014,18:00,19:00\n' +
		'Janet Java,1,4.3.2014,9:45,16:30\n' +
		'Scott Scala,2,4.3.2014,8:30,16:30\n' +
		'Janet Java,1,5.3.2014,8:00,16:30\n' +
		'Scott Scala,2,5.3.2014,9:00,17:00\n' +
		'Janet Java,1,6.3.2014,8:00,12:00\n' +
		'Janet Java,1,6.3.2014,16:00,22:00\n' +
		'Scott Scala,2,6.3.2014,8:15,17:00\n' +
		'Larry Lolcode,3,6.3.2014,5:00,10:00\n' +
		'Scott Scala,2,13.3.2014,14:00,1:15\n' +
		'Larry Lolcode,3,14.3.2014,5:00,20:15\n' +
		'Scott Scala,2,15.3.2014,22:00,22:00\n' +
		'Larry Lolcode,3,30.3.2014,8:00,16:00'

	setModalVisible(visible) {
		this.setState({modalVisible: visible});
	}

	loadCSV() {
		let parsed = Papa.parse(this.csvData, {
			// let parsed = Papa.parse('./src/dataList.csv', {
			// 	download: true,
			// 	delimiter: '\t',
			header: true,
			skipEmptyLines: true,
		})
		// console.log(parsed.data)
		return parsed.data
	}

	timeToDecimal(t) {
		let arr = t.split(':');
		return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1] / 6) * 10, 10));
	}

	calculateTotalHours(start, end) {

		return end + (end < start ? 24 : 0) - start
	}

	calculateEveningHours(start, end) {
		let EveningHours = 0
		// console.log('NextEntry: ', start, end)
		end = end + (end < start ? 24 : 0)
		// console.log('newEnd: ',end)
		if (30 > end && end > 18) {
			EveningHours += end - ( start > 18 ? (18 *2 - start ) : 18 )
			// console.log('30 > end > 18: ',EveningHours)
		}
		if (start > 18) {
			EveningHours += 24 + 6 - start
			// console.log('start > 18: ',EveningHours)
		}
		if (start < 6) {
			EveningHours += 6 - start
			// console.log('start < 6: ',EveningHours)
		}
		// console.log('endEntry: ',EveningHours)
		return EveningHours
	}

	calculateOvertimeHours(start, end) {
		return end + (end < start ? 24 : 0) - start
	}


	render() {
		return (
			<View>
				<View style={{marginLeft: 22}}>
					<Modal
						animationType="slide"
						transparent={false}
						visible={this.state.modalVisible}
						onRequestClose={() => {
							alert("Modal has been closed.")
						}}
					>
						<View style={{margin: 22}}>
							<View>
								<Text>Hello World!</Text>
								<TouchableHighlight onPress={() => {
									this.setModalVisible(!this.state.modalVisible)
								}}>
									<Text>Hide Modal</Text>
								</TouchableHighlight>
							</View>
						</View>
					</Modal>
				</View>
				<Button
					onPress={() => this.setModalVisible(true)}
					title="Calculate"
					color="#841584"
					accessibilityLabel="Learn more about this purple button"
				/>
				<FlatList

					data={this.loadCSV()}
					renderItem={({item}) =>
						<View style={styles.container}>
							<Text style={{
								flex: 0.5,
								flexDirection: 'row',
								justifyContent: 'center',
								textAlign: 'right',
								alignItems: 'center',
								backgroundColor: 'blue',
							}}>{item.Person_ID}</Text>
							<Text style={{flex: 3}}>{item.Person_Name}</Text>
							<Text style={{flex: 2, textAlign: 'right',}}>{item.Date}</Text>
							<Text style={{flex: 1, textAlign: 'right', marginRight: 5,}}>{this.timeToDecimal(item.Start)}</Text>
							<Text style={{flex: 1}}>{this.timeToDecimal(item.End)}</Text>
							<Text
								style={{flex: 1}}>{this.calculateTotalHours(this.timeToDecimal(item.Start), this.timeToDecimal(item.End))}</Text>
							<Text style={{flex: 1}}>{this.calculateEveningHours(this.timeToDecimal(item.Start), this.timeToDecimal(item.End))}</Text>
						</View>

					}
				/>
			</View>
		);
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
});
