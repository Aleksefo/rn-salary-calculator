import React from 'react';
import {Button, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Papa from 'papaparse'

export default class App extends React.Component {

	state = {
		modalVisible: false,
		currentDate: '',
		users: {}
	}

	rateHourly = 3.75
	rateEvening = 1.15

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
		'Janet Java,1,7.3.2014,9:00,17:00\n' +
		'Scott Scala,2,7.3.2014,8:15,17:00\n' +
		'Larry Lolcode,3,7.3.2014,5:00,10:00\n' +
		'Scott Scala,2,9.3.2014,14:00,16:00\n' +
		'Janet Java,1,10.3.2014,8:45,16:45\n' +
		'Scott Scala,2,10.3.2014,8:15,16:15\n' +
		'Scott Scala,2,10.3.2014,22:00,23:00\n' +
		'Larry Lolcode,3,10.3.2014,8:00,16:00\n' +
		'Janet Java,1,11.3.2014,9:00,17:30\n' +
		'Scott Scala,2,11.3.2014,8:30,17:00\n' +
		'Janet Java,1,12.3.2014,16:00,2:00\n' +
		'Scott Scala,2,12.3.2014,9:00,17:30\n' +
		'Larry Lolcode,3,12.3.2014,12:30,12:45\n' +
		'Janet Java,1,13.3.2014,10:00,15:00\n' +
		'Scott Scala,2,13.3.2014,14:00,1:15\n' +
		'Larry Lolcode,3,13.3.2014,10:00,11:00\n' +
		'Janet Java,1,14.3.2014,9:00,17:00\n' +
		'Scott Scala,2,14.3.2014,9:30,17:00\n' +
		'Larry Lolcode,3,14.3.2014,8:45,15:45\n' +
		'Larry Lolcode,3,15.3.2014,9:00,10:15\n' +
		'Larry Lolcode,3,15.3.2014,12:30,13:15\n' +
		'Larry Lolcode,3,15.3.2014,15:30,17:15\n' +
		'Janet Java,1,16.3.2014,8:00,22:00\n' +
		'Janet Java,1,17.3.2014,8:45,16:45\n' +
		'Scott Scala,2,17.3.2014,8:30,16:30\n' +
		'Larry Lolcode,3,17.3.2014,8:30,15:30\n' +
		'Janet Java,1,18.3.2014,9:30,16:30\n' +
		'Scott Scala,2,18.3.2014,8:30,16:30\n' +
		'Larry Lolcode,3,18.3.2014,9:00,15:45\n' +
		'Janet Java,1,19.3.2014,9:30,16:30\n' +
		'Scott Scala,2,19.3.2014,12:00,14:00\n' +
		'Larry Lolcode,3,19.3.2014,8:30,15:45\n' +
		'Janet Java,1,20.3.2014,2:00,6:00\n' +
		'Janet Java,1,20.3.2014,10:00,19:00\n' +
		'Scott Scala,2,20.3.2014,12:00,14:00\n' +
		'Larry Lolcode,3,20.3.2014,1:00,3:00\n' +
		'Janet Java,1,21.3.2014,8:15,16:15\n' +
		'Scott Scala,2,21.3.2014,10:00,18:00\n' +
		'Larry Lolcode,3,21.3.2014,6:00,17:00\n' +
		'Scott Scala,2,23.3.2014,14:00,14:30\n' +
		'Scott Scala,2,23.3.2014,15:00,15:15\n' +
		'Janet Java,1,24.3.2014,8:45,16:30\n' +
		'Scott Scala,2,24.3.2014,22:00,6:00\n' +
		'Janet Java,1,25.3.2014,9:30,18:30\n' +
		'Scott Scala,2,25.3.2014,9:30,17:30\n' +
		'Larry Lolcode,3,25.3.2014,9:00,16:00\n' +
		'Janet Java,1,26.3.2014,9:30,16:45\n' +
		'Scott Scala,2,26.3.2014,10:00,18:00\n' +
		'Larry Lolcode,3,26.3.2014,9:30,17:00\n' +
		'Janet Java,1,27.3.2014,9:00,16:45\n' +
		'Scott Scala,2,27.3.2014,9:00,17:00\n' +
		'Janet Java,1,28.3.2014,10:00,14:00\n' +
		'Scott Scala,2,28.3.2014,8:30,19:00\n' +
		'Larry Lolcode,3,28.3.2014,6:00,16:00\n' +
		'Larry Lolcode,3,30.3.2014,8:00,16:00'

	setModalVisible(visible) {
		this.setState({modalVisible: visible});
		console.log(this.state.users)
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

	preCalculateWages() {
		let objs = []
		let toState = []
		this.loadCSV().map(entry => {
			let hoursCombo
			let worked = ''
			let overtimeMultipliedHours = 0
						// Check for existing entry to prevent Undefined error
			if (objs[entry.Person_ID] === undefined) {
				objs[entry.Person_ID] = {name: entry.Person_Name, eveningHours: 0, overtimeMultipliedHours: 0, hoursCombo: 0, worked: ''}
			}
			// Get evening hours and add them to total eveningHours
			let eveningHours = this.calculateEveningHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			eveningHours += objs[entry.Person_ID].eveningHours
			// Gets total daily hours
			let todayHours = this.calculateDailyHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			// dailyHours += objs[entry.Person_ID].dailyHours
			// Overtime calculations
			if (entry.Date === objs[entry.Person_ID].worked) {
				hoursCombo = objs[entry.Person_ID].hoursCombo + todayHours
			} else {
				worked = entry.Date
				hoursCombo = objs[entry.Person_ID].hoursCombo
				overtimeMultipliedHours = this.calculateOvertimeHours(hoursCombo)
				overtimeMultipliedHours += objs[entry.Person_ID].overtimeMultipliedHours
				hoursCombo = todayHours
			}
			objs[entry.Person_ID] = {name: entry.Person_Name, eveningHours, overtimeMultipliedHours, hoursCombo, worked}
			console.log('Calculated Object: ', objs)
		})
		// for(let entry of Object.entries(objs)) {
		// 	// console.log('Entry: ', entry)
		// 	// console.log('EntryH: ', entry.hoursCombo)
		// 	let lastDayOvertime = this.calculateOvertimeHours(this.hoursCombo)
		// 	let totalHours = this.overtimeMultipliedHours + lastDayOvertime
		// 	let name = this.name
		// 	let salary = totalHours*this.rateHourly + this.eveningHours*this.rateEvening
		// 	// console.log('Salary: ', salary)
		// 	toState[entry] = {name, salary}
		// }
		// for (i = 0;i < Object.keys(objs).length; i++) {
		// 	hoursCombo = objs.this[i].hoursCombo
		// 		console.log('Entry: ', hoursCombo)
		//
		// }
		// for (let key in objs) {
		// 	hoursCombo = key.hoursCombo
		// 	console.log('Entry: ', hoursCombo)
		//
		// }
		objs.map(
			(entry, index) => {

					let lastDayOvertime = this.calculateOvertimeHours(entry.hoursCombo)
					let totalHours = entry.overtimeMultipliedHours + lastDayOvertime
					let name = entry.name
					let salary = totalHours*this.rateHourly + entry.eveningHours*this.rateEvening
					toState[index] = {name, salary}

			}
		)
		console.log('Calculated Object: ', toState)
		this.setState({users: toState})
	}

	timeToDecimal(t) {
		let arr = t.split(':')
		return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1] / 6) * 10, 10))
	}

	calculateDailyHours(start, end) {
		return end + (end < start ? 24 : 0) - start
	}

	calculateEveningHours(start, end) {
		let eveningHours = 0
		end = end + (end < start ? 24 : 0)
		if (30 > end && end > 18) {
			eveningHours += end - ( start > 18 ? 24 : 18 )
		}
		if (30 < end ) {
			eveningHours += 30 - ( start > 18 ? 24 : 18 )
		}
		if (start > 18) {
			eveningHours += 24 - start
		}
		if (start < 6) {
			eveningHours += 6 - start
		}
		return eveningHours
	}

	calculateOvertimeHours(hours) {
		let extraHours = hours
			if (hours > 8) {
				extraHours += ( hours - 8 ) * 0.25
				if (hours > 10) {
					extraHours += ( hours - 10 ) * 0.25
					if (hours > 12) {
						extraHours += ( hours - 12 ) * 0.5
					}
				}
			}
			return extraHours
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
					// onPress={() => this.setModalVisible(true)}
					onPress={() => this.preCalculateWages()}
					title="Calculate"
					color="#841584"
					accessibilityLabel="Learn more about this purple button"
				/>
				<Button
					// onPress={() => this.setModalVisible(true)}
					onPress={() => console.log(this.state)}
					title="CurrentState"
					color="#841884"
					accessibilityLabel="Learn more about this purple button"
				/>
				<FlatList

					data={this.loadCSV()}
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
							}}>{item.Person_ID}</Text>
							<Text style={{flex: 3}}>{item.Person_Name}</Text>
							<Text style={{flex: 2, textAlign: 'right',}}>{item.Date}</Text>
							<Text style={{flex: 1, textAlign: 'right', marginRight: 5,}}>{this.timeToDecimal(item.Start)}</Text>
							<Text style={{flex: 1}}>{this.timeToDecimal(item.End)}</Text>
							<Text
								style={{flex: 1}}>{this.calculateDailyHours(this.timeToDecimal(item.Start), this.timeToDecimal(item.End))}</Text>
							<Text
								style={{flex: 1}}>{this.calculateEveningHours(this.timeToDecimal(item.Start), this.timeToDecimal(item.End), item.Person_ID)}</Text>
							{/*<Text*/}
							{/*style={{flex: 1}}>{this.calculateOvertimeHours(item.Person_ID, item.Date, this.calculateTotalHours(this.timeToDecimal(item.Start), this.timeToDecimal(item.End)))}</Text>*/}
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
