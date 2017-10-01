import React from 'react';
import {Button, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Papa from 'papaparse'

export default class App extends React.Component {

	state = {
		modalVisible: false,
		currentDate: '',
		users: {}
	}

	RateHourly = 3.75
	RateEvening = 1.15

	csvData = 'Person_Name,Person_ID,Date,Start,End\n' +
		// 'Scott Scala,2,2.3.2014,4:00,17:00\n' +
		// 'Janet Java,1,3.3.2014,4:00,20:00\n' +
		'Scott Scala,2,3.3.2014,7:00,20:00\n' +
		// 'Larry Lolcode,3,3.3.2014,7:00,3:00\n' +
		// 'Janet Java,1,4.3.2014,9:45,16:30\n' +
		// 'Scott Scala,2,4.3.2014,8:30,16:30\n' +
		// 'Janet Java,1,5.3.2014,8:00,16:30\n' +
		// 'Scott Scala,2,5.3.2014,9:00,17:00\n' +
		// 'Janet Java,1,6.3.2014,8:00,12:00\n' +
		// 'Janet Java,1,6.3.2014,16:00,22:00\n' +
		// 'Scott Scala,2,6.3.2014,8:15,17:00\n' +
		// 'Larry Lolcode,3,6.3.2014,5:00,10:00\n' +
		'Scott Scala,2,13.3.2014,19:00,3:00\n' +
		// 'Larry Lolcode,3,14.3.2014,5:00,20:15\n' +
		// 'Scott Scala,2,15.3.2014,22:00,22:00\n' +
		'Larry Lolcode,3,30.3.2014,21:00,07:00'

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

	renderNews() {
		let objs = {}
		let eveningHours
		let dailyEveningHours = 0
		let totalHours
		let dailyTotalHours = 0
		let overtimeHours = 0
		let worked = ''
		let overtimePayment
		this.loadCSV().map(entry => {
			totalHours = this.calculateTotalHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			eveningHours = this.calculateEveningHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End), entry.Person_ID)
			// console.log('eveningHours: ', eveningHours)
			if (objs[entry.Person_ID] === undefined) {
				objs[entry.Person_ID] = {dailyEveningHours, dailyTotalHours, overtimeHours, worked}
			}
				dailyEveningHours = objs[entry.Person_ID].dailyEveningHours + eveningHours
				dailyTotalHours = objs[entry.Person_ID].dailyTotalHours + totalHours
			if (entry.Date === objs[entry.Person_ID].worked) {
				overtimeHours += totalHours
			} else {
				worked = entry.Date
				overtimeHours = objs[entry.Person_ID].overtimeHours
				overtimePayment = this.calculateOvertimeHours(overtimeHours)
				overtimeHours = totalHours
			}

			//finisher to calculate overtime leftovers
			objs[entry.Person_ID] = {dailyEveningHours, dailyTotalHours, overtimeHours, worked}
			console.log('Calculated Object: ', objs)
		})
	}

	timeToDecimal(t) {
		let arr = t.split(':');
		return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1] / 6) * 10, 10));
	}

	calculateTotalHours(start, end) {

		return end + (end < start ? 24 : 0) - start
	}

	calculateEveningHours(start, end, id) {
		let eveningHours = 0
		// console.log('NextEntry: ', start, end)
		end = end + (end < start ? 24 : 0)
		// console.log('newEnd: ',end)
		if (30 > end && end > 18) {
			eveningHours += end - ( start > 18 ? 24 : 18 )
			// console.log('30 > end > 18: ',eveningHours)
		}
		if (30 < end ) {
			eveningHours += 30 - ( start > 18 ? 24 : 18 )
			// console.log('30 < end: ',eveningHours)
		}
		if (start > 18) {
			eveningHours += 24 - start
			// console.log('start > 18: ',eveningHours)
		}
		if (start < 6) {
			eveningHours += 6 - start
			// console.log('start < 6: ',eveningHours)
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
						extraHours = ( hours - 12 ) * 0.5
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
					onPress={() => this.renderNews()}
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
								style={{flex: 1}}>{this.calculateTotalHours(this.timeToDecimal(item.Start), this.timeToDecimal(item.End))}</Text>
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
