import React from 'react';
import {Button, FlatList, Modal, StyleSheet, Text, TouchableHighlight, View} from 'react-native';
import Papa from 'papaparse'
import ListDays from './src/ListDays'
import ShowModal from './src/ShowModal'

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

//Loads CSV from a remote source, sets the parsed data as State to render it as a list later, and runs salary calculation function
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

//Calculates all CSV data into salaries.
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
			// Gets total hours for a day
			let todayHours = this.calculateDailyHours(this.timeToDecimal(entry.Start), this.timeToDecimal(entry.End))
			// Overtime calculations. If it's still the same day, add hours from the shift to total hours worked today, otherwise calculates overtime hours
			if (entry.Date === objs[entry['Person ID']].worked) {
				hoursCombo = objs[entry['Person ID']].hoursCombo + todayHours
			} else {
				worked = entry.Date
				hoursCombo = objs[entry['Person ID']].hoursCombo
				overtimeMultipliedHours = this.calculateOvertimeHours(hoursCombo)
				overtimeMultipliedHours += objs[entry['Person ID']].overtimeMultipliedHours
				hoursCombo = todayHours
			}
			// Saves the data as an object with temporary calculation values
			objs[entry['Person ID']] = {name: entry['Person Name'], eveningHours, overtimeMultipliedHours, hoursCombo, worked}
		})
		//Second part. Uses temporary values to calculate the total salary
		objs.map(
			(entry, index) => {
				// Calculates the overtime of a last day if any exists.
				let lastDayOvertime = this.calculateOvertimeHours(entry.hoursCombo)
				let totalHours = entry.overtimeMultipliedHours + lastDayOvertime
				let name = entry.name
				let rawSalary = totalHours * this.rateHourly + entry.eveningHours * this.rateEvening
				// Rounds the salary to cents
				let salary = Math.round(rawSalary * 100) / 100
				toState[index - 1] = {name, salary}
			}
		)
		// Saves the salary data to the state.
		this.setState({users: toState})
	}

	// Converts CSV time to decimal value
	timeToDecimal(t) {
		let arr = t.split(':')
		return parseFloat(parseInt(arr[0], 10) + '.' + parseInt((arr[1] / 6) * 10, 10))
	}

	// Calculates Difference between Start and End time
	calculateDailyHours(start, end) {
		return end + (end < start ? 24 : 0) - start
	}

	// Calculates Difference between Start and End time for extra evening pay
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

	// Calculates overtime bonus, based on hours worked per day
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
				<ShowModal modalVisible={this.state.modalVisible} users={this.state.users}/>
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
						<ListDays item={item}/>
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
