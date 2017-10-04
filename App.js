import React from 'react';
import {Button, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Papa from 'papaparse'

export default class App extends React.Component {

	state = {
		modalVisible: false,
		currentDate: '',
		parsedData: [],
		users: {}
	}

	rateHourly = 3.75
	rateEvening = 1.15

	componentDidMount() {
		this.loadCSV()
	}

	setModalVisible(visible) {
		this.setState({modalVisible: visible})
	}

	loadCSV() {
		var that = this
		Papa.parse('https://raw.github.com/Aleksefo/rn-salary-calculator/master/src/dataList.csv', {
			download: true,
			complete: function (results) {
				that.setState({parsedData: results.data})
				that.preCalculateWages(results.data)
			},
			header: true,
			skipEmptyLines: true,
		})
	}

	preCalculateWages(results) {
		let objs = []
		let toState = []
		results.map(entry => {
			let hoursCombo
			let worked = ''
			let overtimeMultipliedHours = 0
			// Check for existing entry to prevent Undefined error
			if (objs[entry['Person ID']] === undefined) {
				objs[entry['Person ID']] = {
					name: entry['Person Name'],
					eveningHours: 0,
					overtimeMultipliedHours: 0,
					hoursCombo: 0,
					worked: ''
				}
			}
			// Get evening hours and add them to total eveningHours
			let eveningHours = this.calculateEveningHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			eveningHours += objs[entry['Person ID']].eveningHours
			// Gets total daily hours
			let todayHours = this.calculateDailyHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			// dailyHours += objs[entry.Person_ID].dailyHours
			// Overtime calculations
			if (entry.Date === objs[entry['Person ID']].worked) {
				hoursCombo = objs[entry['Person ID']].hoursCombo + todayHours
			} else {
				worked = entry.Date
				hoursCombo = objs[entry['Person ID']].hoursCombo
				overtimeMultipliedHours = this.calculateOvertimeHours(hoursCombo)
				overtimeMultipliedHours += objs[entry['Person ID']].overtimeMultipliedHours
				hoursCombo = todayHours
			}
			objs[entry['Person ID']] = {name: entry['Person Name'], eveningHours, overtimeMultipliedHours, hoursCombo, worked}
			// console.log('Calculated Object: ', objs)
		})
		objs.map(
			(entry, index) => {
				let lastDayOvertime = this.calculateOvertimeHours(entry.hoursCombo)
				let totalHours = entry.overtimeMultipliedHours + lastDayOvertime
				let name = entry.name
				let rawSalary = totalHours * this.rateHourly + entry.eveningHours * this.rateEvening
				let salary = Math.round(rawSalary * 100) / 100
				toState[index - 1] = {name, salary}
			}
		)
		// console.log('Calculated Object: ', toState)
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
		if (30 < end) {
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
			<View style={{marginTop: Expo.Constants.statusBarHeight}}>
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
								<FlatList
									data={this.state.users}
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
						</View>
					</Modal>
				</View>
				<Button
					// onPress={() => this.setModalVisible(true)}
					onPress={() => this.setModalVisible(true)}
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

					data={this.state.parsedData}
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
							}}>{item['Person ID']}</Text>
							<Text style={{flex: 3}}>{item['Person Name']}</Text>
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
